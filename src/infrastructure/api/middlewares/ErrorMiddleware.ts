import { FastifyInstance } from 'fastify';
import { Exception } from '@domain/exceptions';

export const errorHandler = (application: FastifyInstance): void => {
    application.setErrorHandler(async (error, request, reply) => {
        if (error instanceof Exception) {
            reply.status(error.statusCode).send({
                success: false,
                message: error.message,
                code: error.code,
                timestamp: new Date(),
            });
            return;
        }

        console.error('Unhandled error:', error);
        reply.status(500).send({
            success: false,
            message: 'Internal Server Error',
            timestamp: new Date(),
        });
    });
};
