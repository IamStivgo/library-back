import { FastifyInstance } from 'fastify';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { GetAuditLogsService } from '@application/services/GetAuditLogs.service';
import { authMiddleware, requirePermission, AuthenticatedRequest } from '../middlewares/AuthMiddleware';

export const auditRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        '/audit/logs',
        {
            preHandler: [authMiddleware, requirePermission('audit:read', 'user:list')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { userId, action, resource, status, startDate, endDate, limit, offset } = request.query as any;

                const filters: any = {};
                if (userId) filters.userId = userId;
                if (action) filters.action = action;
                if (resource) filters.resource = resource;
                if (status) filters.status = status;
                if (startDate) filters.startDate = new Date(startDate);
                if (endDate) filters.endDate = new Date(endDate);

                const getAuditLogsService = DEPENDENCY_CONTAINER.get(GetAuditLogsService);
                const result = await getAuditLogsService.execute({
                    filters,
                    limit: limit ? parseInt(limit) : 50,
                    offset: offset ? parseInt(offset) : 0,
                });

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Failed to get audit logs',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: result.value,
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
        '/audit/logs/user/:userId',
        {
            preHandler: [authMiddleware, requirePermission('audit:read', 'user:read')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { userId } = request.params as any;
                const { limit, offset } = request.query as any;

                const getAuditLogsService = DEPENDENCY_CONTAINER.get(GetAuditLogsService);
                const result = await getAuditLogsService.execute({
                    filters: { userId },
                    limit: limit ? parseInt(limit) : 50,
                    offset: offset ? parseInt(offset) : 0,
                });

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Failed to get audit logs',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: result.value,
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
