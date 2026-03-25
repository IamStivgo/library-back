import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { UserRepository, AuthRepository, RoleRepository } from '@domain/repository';
import { AuthResponse } from '@application/dto/out/AuthOutputModels';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { JwtService } from '@application/util/jwt.service';
import { GitHubAuthService } from '@application/util/github-auth.service';

export interface GitHubAuthInputModel {
    accessToken: string;
}

@injectable()
export class GitHubAuthLoginService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.RoleRepository) private roleRepository: RoleRepository,
    ) {}

    async execute(input: GitHubAuthInputModel): Promise<ServiceResult<AuthResponse>> {
        const githubUserInfo = await GitHubAuthService.verifyGitHubToken(input.accessToken);

        if (!githubUserInfo) {
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid GitHub token'));
        }

        const userResult = await this.userRepository.findByGitHubId(githubUserInfo.githubId);

        let user;

        if (!userResult.isSuccess) {
            return ServiceResult.fail(userResult.error!);
        }

        if (!userResult.value) {
            const emailUserResult = await this.userRepository.findByEmail(githubUserInfo.email);

            if (emailUserResult.isSuccess && emailUserResult.value) {
                user = emailUserResult.value;

                await this.userRepository.update(user.id, {
                    fullName: githubUserInfo.name,
                    avatarUrl: githubUserInfo.picture,
                    emailVerified: githubUserInfo.emailVerified,
                });
            } else {
                const createResult = await this.userRepository.create({
                    email: githubUserInfo.email,
                    githubId: githubUserInfo.githubId,
                    fullName: githubUserInfo.name,
                    avatarUrl: githubUserInfo.picture,
                    emailVerified: githubUserInfo.emailVerified,
                });

                if (!createResult.isSuccess) {
                    return ServiceResult.fail(createResult.error!);
                }

                user = createResult.value!;

                const memberRoleResult = await this.roleRepository.findByName('member');

                if (memberRoleResult.isSuccess && memberRoleResult.value) {
                    await this.userRepository.assignRole(user.id, memberRoleResult.value.id);
                }
            }
        } else {
            user = userResult.value;
        }

        if (!user.isActive) {
            return ServiceResult.fail(new AppError(ErrorCode.FORBIDDEN, 'Account is deactivated'));
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
