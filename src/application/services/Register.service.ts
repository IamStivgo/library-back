import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { UserRepository, AuthRepository, RoleRepository } from '@domain/repository';
import { RegisterInputModel } from '@application/dto/in/AuthInputModels';
import { AuthResponse } from '@application/dto/out/AuthOutputModels';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { JwtService } from '@application/util/jwt.service';

@injectable()
export class RegisterService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.RoleRepository) private roleRepository: RoleRepository,
    ) {}

    async execute(input: RegisterInputModel): Promise<ServiceResult<AuthResponse>> {
        const existingUserResult = await this.userRepository.findByEmail(input.email);

        if (!existingUserResult.isSuccess) {
            return ServiceResult.fail(existingUserResult.error!);
        }

        if (existingUserResult.value) {
            return ServiceResult.fail(new AppError(ErrorCode.DUPLICATE_RESOURCE, 'Email already registered'));
        }

        const createResult = await this.userRepository.create({
            email: input.email,
            password: input.password,
            username: input.username,
            fullName: input.fullName,
            emailVerified: false,
        });

        if (!createResult.isSuccess) {
            return ServiceResult.fail(createResult.error!);
        }

        const user = createResult.value!;

        const memberRoleResult = await this.roleRepository.findByName('member');

        if (memberRoleResult.isSuccess && memberRoleResult.value) {
            await this.userRepository.assignRole(user.id, memberRoleResult.value.id);
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
