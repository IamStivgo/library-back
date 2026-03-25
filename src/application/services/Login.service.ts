import { injectable, inject } from 'inversify';
import * as bcrypt from 'bcryptjs';
import { TYPES } from '@configuration/Types';
import { UserRepository, AuthRepository, RoleRepository } from '@domain/repository';
import { LoginInputModel } from '@application/dto/in/AuthInputModels';
import { AuthResponse } from '@application/dto/out/AuthOutputModels';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { JwtService } from '@application/util/jwt.service';

@injectable()
export class LoginService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.RoleRepository) private roleRepository: RoleRepository,
    ) {}

    async execute(input: LoginInputModel): Promise<ServiceResult<AuthResponse>> {
        const userResult = await this.userRepository.findByEmail(input.email);

        if (!userResult.isSuccess) {
            return ServiceResult.fail(userResult.error!);
        }

        const user = userResult.value;

        if (!user) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials'));
        }

        if (!user.isActive) {
            return ServiceResult.fail(new AppError(ErrorCode.FORBIDDEN, 'Account is deactivated'));
        }

        if (!user.passwordHash) {
            return ServiceResult.fail(
                new AppError(ErrorCode.UNAUTHORIZED, 'Please use Google Sign-In for this account'),
            );
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!isPasswordValid) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials'));
        }

        const userWithRolesResult = await this.userRepository.getUserWithRoles(user.id);

        if (!userWithRolesResult.isSuccess) {
            return ServiceResult.fail(userWithRolesResult.error!);
        }

        const userWithRoles = userWithRolesResult.value!;

        const payload = {
            userId: user.id,
            email: user.email,
            roles: userWithRoles.roles.map((r) => r.name),
            permissions: userWithRoles.permissions.map((p) => p.name),
        };

        const accessToken = JwtService.generateAccessToken(payload);
        const refreshToken = JwtService.generateRefreshToken(payload);

        const expiresAt = JwtService.getTokenExpiry(refreshToken);
        if (expiresAt) {
            await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);
        }

        await this.userRepository.updateLastLogin(user.id);

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
                accessToken,
                refreshToken,
                expiresIn: 900,
            },
        };

        return ServiceResult.ok(authResponse);
    }
}
