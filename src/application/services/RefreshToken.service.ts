import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { UserRepository, AuthRepository } from '@domain/repository';
import { RefreshTokenInputModel } from '@application/dto/in/AuthInputModels';
import { AuthResponse } from '@application/dto/out/AuthOutputModels';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { JwtService } from '@application/util/jwt.service';

@injectable()
export class RefreshTokenService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
    ) {}

    async execute(input: RefreshTokenInputModel): Promise<ServiceResult<AuthResponse>> {
        const tokenPayload = JwtService.verifyRefreshToken(input.refreshToken);

        if (!tokenPayload) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid refresh token'));
        }

        const storedTokenResult = await this.authRepository.findRefreshToken(input.refreshToken);

        if (!storedTokenResult.isSuccess) {
            return ServiceResult.fail(storedTokenResult.error!);
        }

        const storedToken = storedTokenResult.value;

        if (!storedToken || storedToken.revoked) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Refresh token revoked or not found'));
        }

        if (storedToken.expiresAt < new Date()) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Refresh token expired'));
        }

        const userWithRolesResult = await this.userRepository.getUserWithRoles(tokenPayload.userId);

        if (!userWithRolesResult.isSuccess) {
            return ServiceResult.fail(userWithRolesResult.error!);
        }

        const userWithRoles = userWithRolesResult.value;

        if (!userWithRoles) {
            return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'User not found'));
        }

        const userResult = await this.userRepository.findById(tokenPayload.userId);

        if (!userResult.isSuccess || !userResult.value) {
            return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'User not found'));
        }

        const user = userResult.value;

        const newPayload = {
            userId: user.id,
            email: user.email,
            roles: userWithRoles.roles.map((r) => r.name),
            permissions: userWithRoles.permissions.map((p) => p.name),
        };

        const newAccessToken = JwtService.generateAccessToken(newPayload);
        const newRefreshToken = JwtService.generateRefreshToken(newPayload);

        await this.authRepository.revokeRefreshToken(input.refreshToken);

        const expiresAt = JwtService.getTokenExpiry(newRefreshToken);
        if (expiresAt) {
            await this.authRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);
        }

        const authResponse: AuthResponse = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                roles: userWithRoles.roles.map((r) => r.name),
                permissions: userWithRoles.permissions.map((p) => p.name),
            },
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: 900,
            },
        };

        return ServiceResult.ok(authResponse);
    }
}
