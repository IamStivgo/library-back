import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '@application/util/jwt.service';

export interface AuthenticatedRequest extends FastifyRequest {
    user?: {
        userId: string;
        email: string;
        roles: string[];
        permissions: string[];
    };
}

export const authMiddleware = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                success: false,
                message: 'No authorization token provided',
            });
        }

        const token = authHeader.substring(7);
        const payload = JwtService.verifyAccessToken(token);

        if (!payload) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid or expired token',
            });
        }

        request.user = {
            userId: payload.userId,
            email: payload.email,
            roles: payload.roles,
            permissions: payload.permissions,
        };
    } catch (error) {
        return reply.status(401).send({
            success: false,
            message: 'Authentication failed',
        });
    }
};

export const requirePermission =
    (...permissions: string[]) =>
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required',
            });
        }

        const hasPermission = permissions.some((permission) => request.user!.permissions.includes(permission));

        if (!hasPermission) {
            return reply.status(403).send({
                success: false,
                message: 'Insufficient permissions',
                required: permissions,
            });
        }
    };

export const requireRole =
    (...roles: string[]) =>
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required',
            });
        }

        const hasRole = roles.some((role) => request.user!.roles.includes(role));

        if (!hasRole) {
            return reply.status(403).send({
                success: false,
                message: 'Insufficient role',
                required: roles,
            });
        }
    };

export const optionalAuth = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = JwtService.verifyAccessToken(token);

            if (payload) {
                request.user = {
                    userId: payload.userId,
                    email: payload.email,
                    roles: payload.roles,
                    permissions: payload.permissions,
                };
            }
        }
    } catch (error) {
        console.log('Optional auth failed, continuing without user');
    }
};
