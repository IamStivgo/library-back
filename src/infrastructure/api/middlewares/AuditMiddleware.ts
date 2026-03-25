import { FastifyRequest, FastifyReply } from 'fastify';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { AuditService } from '@application/services/Audit.service';
import { AuthenticatedRequest } from './AuthMiddleware';

export const auditMiddleware = (action: string, resource: string) => {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
        const auditService = DEPENDENCY_CONTAINER.get(AuditService);

        const originalSend = reply.send.bind(reply);

        reply.send = function (payload: any) {
            const statusCode = reply.statusCode;
            const status = statusCode >= 200 && statusCode < 300 ? 'success' : 'failure';

            const resourceId =
                request.params && typeof request.params === 'object' && 'id' in request.params
                    ? (request.params as any).id
                    : undefined;

            auditService
                .log({
                    userId: request.user?.userId,
                    userEmail: request.user?.email,
                    action,
                    resource,
                    resourceId,
                    details: {
                        method: request.method,
                        url: request.url,
                        body: request.body,
                        query: request.query,
                    },
                    ipAddress: request.ip,
                    userAgent: request.headers['user-agent'],
                    status,
                    errorMessage: status === 'failure' && payload ? JSON.stringify(payload) : undefined,
                })
                .catch((error) => {
                    console.error('Audit logging failed:', error);
                });

            return originalSend(payload);
        };
    };
};
