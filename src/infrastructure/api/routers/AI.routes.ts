import { FastifyInstance } from 'fastify';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { AIChatService } from '@application/services/AIChat.service';
import { AIRecommendationsService } from '@application/services/AIRecommendations.service';
import { AIBookSummaryService } from '@application/services/AIBookSummary.service';
import { AICollectionAnalysisService } from '@application/services/AICollectionAnalysis.service';
import { AISemanticSearchService } from '@application/services/AISemanticSearch.service';
import { AIReadingTrendsService } from '@application/services/AIReadingTrends.service';
import { AIGenerateDescriptionService } from '@application/services/AIGenerateDescription.service';
import { AISmartNotificationService } from '@application/services/AISmartNotification.service';
import { chatSchema, recommendationsSchema } from '../schemas/aiSchema';
import { validateRequest } from '../util/Schemas';
import { authMiddleware, requirePermission, AuthenticatedRequest } from '../middlewares/AuthMiddleware';

export const aiRoutes = async (fastify: FastifyInstance) => {
    fastify.post(
        '/ai/chat',
        {
            preHandler: [authMiddleware, requirePermission('ai:chat')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const validation = validateRequest(chatSchema, request.body);

                if (!validation.isValid) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Validation error',
                        errors: validation.errors,
                    });
                }

                const aiChatService = DEPENDENCY_CONTAINER.get(AIChatService);
                const result = await aiChatService.execute(
                    (validation.data as any).messages,
                    (validation.data as any).includeBookContext,
                );

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Failed to generate response',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: {
                        message: result.value,
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

    fastify.post(
        '/ai/recommendations',
        {
            preHandler: [authMiddleware, requirePermission('ai:recommendations')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const validation = validateRequest(recommendationsSchema, request.body);

                if (!validation.isValid) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Validation error',
                        errors: validation.errors,
                    });
                }

                const aiRecommendationsService = DEPENDENCY_CONTAINER.get(AIRecommendationsService);
                const result = await aiRecommendationsService.execute(validation.data as any);

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Failed to generate recommendations',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: {
                        recommendations: result.value,
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

    fastify.get(
        '/ai/books/:id/summary',
        {
            preHandler: [authMiddleware, requirePermission('ai:summary')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { id } = request.params as { id: string };

                const aiBookSummaryService = DEPENDENCY_CONTAINER.get(AIBookSummaryService);
                const result = await aiBookSummaryService.execute(id);

                if (!result.isSuccess) {
                    return reply.status(404).send({
                        success: false,
                        message: result.error?.message || 'Failed to generate summary',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: {
                        summary: result.value,
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

    fastify.get(
        '/ai/collection/analysis',
        {
            preHandler: [authMiddleware, requirePermission('ai:summary')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const aiCollectionAnalysisService = DEPENDENCY_CONTAINER.get(AICollectionAnalysisService);
                const result = await aiCollectionAnalysisService.execute();

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Failed to analyze collection',
                    });
                }

                return reply.status(200).send({
                    success: true,
                    data: {
                        analysis: result.value,
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

    fastify.post(
        '/ai/search/semantic',
        {
            preHandler: [authMiddleware, requirePermission('ai:chat')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { query } = request.body as { query: string };

                if (!query) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Query is required',
                    });
                }

                const aiSemanticSearchService = DEPENDENCY_CONTAINER.get(AISemanticSearchService);
                const result = await aiSemanticSearchService.execute({ query });

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Semantic search failed',
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

    fastify.post(
        '/ai/reading-trends',
        {
            preHandler: [authMiddleware, requirePermission('ai:recommendations')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { checkoutHistory } = request.body as any;

                if (!checkoutHistory || !Array.isArray(checkoutHistory)) {
                    return reply.status(400).send({
                        success: false,
                        message: 'Checkout history is required',
                    });
                }

                const aiReadingTrendsService = DEPENDENCY_CONTAINER.get(AIReadingTrendsService);
                const result = await aiReadingTrendsService.execute({ checkoutHistory });

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Reading trends analysis failed',
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

    fastify.post(
        '/ai/books/:id/generate-description',
        {
            preHandler: [authMiddleware, requirePermission('book:update')],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { id } = request.params as { id: string };

                const aiGenerateDescriptionService = DEPENDENCY_CONTAINER.get(AIGenerateDescriptionService);
                const result = await aiGenerateDescriptionService.execute({ bookId: id });

                if (!result.isSuccess) {
                    return reply.status(404).send({
                        success: false,
                        message: result.error?.message || 'Failed to generate description',
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

    fastify.post(
        '/ai/notifications/generate',
        {
            preHandler: [authMiddleware],
        },
        async (request: AuthenticatedRequest, reply) => {
            try {
                const { userName, notificationType, data } = request.body as any;

                if (!userName || !notificationType || !data) {
                    return reply.status(400).send({
                        success: false,
                        message: 'userName, notificationType, and data are required',
                    });
                }

                const aiSmartNotificationService = DEPENDENCY_CONTAINER.get(AISmartNotificationService);
                const result = await aiSmartNotificationService.execute({ userName, notificationType, data });

                if (!result.isSuccess) {
                    return reply.status(500).send({
                        success: false,
                        message: result.error?.message || 'Notification generation failed',
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
