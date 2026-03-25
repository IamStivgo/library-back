import { FastifyInstance } from 'fastify';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { LoginService } from '@application/services/Login.service';
import { RegisterService } from '@application/services/Register.service';
import { GoogleAuthLoginService } from '@application/services/GoogleAuthLogin.service';
import { MicrosoftAuthLoginService } from '@application/services/MicrosoftAuthLogin.service';
import { GitHubAuthLoginService } from '@application/services/GitHubAuthLogin.service';
import { RefreshTokenService } from '@application/services/RefreshToken.service';
import { LogoutService } from '@application/services/Logout.service';
import {
    loginSchema,
    registerSchema,
    googleAuthSchema,
    microsoftAuthSchema,
    githubAuthSchema,
    refreshTokenSchema,
} from '../schemas/authSchema';
import { validateRequest } from '../util/Schemas';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/AuthMiddleware';

export const authRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/auth/register', async (request, reply) => {
        try {
            const validation = validateRequest(registerSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const registerService = DEPENDENCY_CONTAINER.get(RegisterService);
            const result = await registerService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(400).send({
                    success: false,
                    message: result.error?.message || 'Registration failed',
                    code: result.error?.code,
                });
            }

            return reply.status(201).send({
                success: true,
                message: 'Registration successful',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post('/auth/login', async (request, reply) => {
        try {
            const validation = validateRequest(loginSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const loginService = DEPENDENCY_CONTAINER.get(LoginService);
            const result = await loginService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(401).send({
                    success: false,
                    message: result.error?.message || 'Login failed',
                    code: result.error?.code,
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Login successful',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post('/auth/google', async (request, reply) => {
        try {
            const validation = validateRequest(googleAuthSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const googleAuthService = DEPENDENCY_CONTAINER.get(GoogleAuthLoginService);
            const result = await googleAuthService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(401).send({
                    success: false,
                    message: result.error?.message || 'Google authentication failed',
                    code: result.error?.code,
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Google authentication successful',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post('/auth/microsoft', async (request, reply) => {
        try {
            const validation = validateRequest(microsoftAuthSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const microsoftAuthService = DEPENDENCY_CONTAINER.get(MicrosoftAuthLoginService);
            const result = await microsoftAuthService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(401).send({
                    success: false,
                    message: result.error?.message || 'Microsoft authentication failed',
                    code: result.error?.code,
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Microsoft authentication successful',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post('/auth/github', async (request, reply) => {
        try {
            const validation = validateRequest(githubAuthSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const githubAuthService = DEPENDENCY_CONTAINER.get(GitHubAuthLoginService);
            const result = await githubAuthService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(401).send({
                    success: false,
                    message: result.error?.message || 'GitHub authentication failed',
                    code: result.error?.code,
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'GitHub authentication successful',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post('/auth/refresh', async (request, reply) => {
        try {
            const validation = validateRequest(refreshTokenSchema, request.body);

            if (!validation.isValid) {
                return reply.status(400).send({
                    success: false,
                    message: 'Validation error',
                    errors: validation.errors,
                });
            }

            const refreshTokenService = DEPENDENCY_CONTAINER.get(RefreshTokenService);
            const result = await refreshTokenService.execute(validation.data as any);

            if (!result.isSuccess) {
                return reply.status(401).send({
                    success: false,
                    message: result.error?.message || 'Token refresh failed',
                    code: result.error?.code,
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Token refreshed successfully',
                data: result.value,
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error',
            });
        }
    });

    fastify.post(
        '/auth/logout',
        {
            preHandler: authMiddleware,
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { refreshToken } = request.body as { refreshToken: string };

                if (!refreshToken) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Refresh token is required',
                    });
                }

                const logoutService = DEPENDENCY_CONTAINER.get(LogoutService);
                const result = await logoutService.execute(refreshToken);

                if (!result.isSuccess) {
                    return reply.status(400).send({
                        success: false,
                        message: result.error?.message || 'Logout failed',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    message: 'Logout successful',
                });
            } catch (error: any) {
                request.log.error(error);
                return reply.status(500).send({
                    success: false,
                    message: 'Internal server error',
                });
            }
        },
    );

    fastify.get(
        '/auth/me',
        {
            preHandler: authMiddleware,
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                return reply.status(200).send({
                    success: true,
                    data: {
                        user: request.user,
                    },
                });
            } catch (error: any) {
                request.log.error(error);
                return reply.status(500).send({
                    success: false,
                    message: 'Internal server error',
                });
            }
        },
    );
};
