import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { UserRepository, AuthRepository, RoleRepository } from '@domain/repository';
import { GoogleAuthInputModel } from '@application/dto/in/AuthInputModels';
import { AuthResponse } from '@application/dto/out/AuthOutputModels';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { JwtService } from '@application/util/jwt.service';
import { GoogleAuthService } from '@application/util/google-auth.service';

@injectable()
export class GoogleAuthLoginService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.RoleRepository) private roleRepository: RoleRepository,
    ) {}

    async execute(input: GoogleAuthInputModel): Promise<ServiceResult<AuthResponse>> {
        console.log('[GoogleAuthLogin] Starting Google authentication');

        const googleUserInfo = await GoogleAuthService.verifyGoogleToken(input.googleToken);

        if (!googleUserInfo) {
            console.log('[GoogleAuthLogin] Invalid Google token');
            return ServiceResult.fail(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid Google token'));
        }

        console.log('[GoogleAuthLogin] Google user info:', {
            email: googleUserInfo.email,
            googleId: googleUserInfo.googleId,
        });

        const userResult = await this.userRepository.findByGoogleId(googleUserInfo.googleId);
        console.log('[GoogleAuthLogin] findByGoogleId result:', {
            isSuccess: userResult.isSuccess,
            hasValue: !!userResult.value,
        });

        let user;

        if (!userResult.isSuccess) {
            console.log('[GoogleAuthLogin] Error finding user by Google ID:', userResult.error);
            return ServiceResult.fail(userResult.error!);
        }

        if (!userResult.value) {
            console.log('[GoogleAuthLogin] User not found by Google ID, searching by email');
            const emailUserResult = await this.userRepository.findByEmail(googleUserInfo.email);
            console.log('[GoogleAuthLogin] findByEmail result:', {
                isSuccess: emailUserResult.isSuccess,
                hasValue: !!emailUserResult.value,
            });

            if (emailUserResult.isSuccess && emailUserResult.value) {
                user = emailUserResult.value;
                console.log('[GoogleAuthLogin] Existing user found, updating with Google info');

                await this.userRepository.update(user.id, {
                    fullName: googleUserInfo.name,
                    avatarUrl: googleUserInfo.picture,
                    emailVerified: googleUserInfo.emailVerified,
                });
            } else {
                console.log('[GoogleAuthLogin] Creating new user');
                const createResult = await this.userRepository.create({
                    email: googleUserInfo.email,
                    googleId: googleUserInfo.googleId,
                    fullName: googleUserInfo.name,
                    avatarUrl: googleUserInfo.picture,
                    emailVerified: googleUserInfo.emailVerified,
                });

                if (!createResult.isSuccess) {
                    console.log('[GoogleAuthLogin] Error creating user:', createResult.error);
                    return ServiceResult.fail(createResult.error!);
                }

                user = createResult.value!;
                console.log('[GoogleAuthLogin] User created successfully:', user.id);

                const memberRoleResult = await this.roleRepository.findByName('member');
                console.log('[GoogleAuthLogin] findByName(member) result:', {
                    isSuccess: memberRoleResult.isSuccess,
                    hasValue: !!memberRoleResult.value,
                });

                if (memberRoleResult.isSuccess && memberRoleResult.value) {
                    await this.userRepository.assignRole(user.id, memberRoleResult.value.id);
                    console.log('[GoogleAuthLogin] Member role assigned');
                }
            }
        } else {
            user = userResult.value;
            console.log('[GoogleAuthLogin] User found by Google ID:', user.id);
        }

        if (!user.isActive) {
            console.log('[GoogleAuthLogin] Account is deactivated');
            return ServiceResult.fail(new AppError(ErrorCode.FORBIDDEN, 'Account is deactivated'));
        }

        console.log('[GoogleAuthLogin] Getting user with roles');
        const userWithRolesResult = await this.userRepository.getUserWithRoles(user.id);
        console.log('[GoogleAuthLogin] getUserWithRoles result:', {
            isSuccess: userWithRolesResult.isSuccess,
            hasValue: !!userWithRolesResult.value,
        });

        if (!userWithRolesResult.isSuccess) {
            console.log('[GoogleAuthLogin] Error getting user with roles:', userWithRolesResult.error);
            return ServiceResult.fail(userWithRolesResult.error!);
        }

        const userWithRoles = userWithRolesResult.value!;

        const payload = {
            userId: user.id,
            email: user.email,
            roles: userWithRoles.roles.map((r) => r.name),
            permissions: userWithRoles.permissions.map((p) => p.name),
        };

        console.log('[GoogleAuthLogin] Generating tokens');
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

        console.log('[GoogleAuthLogin] Authentication successful');
        return ServiceResult.ok(authResponse);
    }
}
