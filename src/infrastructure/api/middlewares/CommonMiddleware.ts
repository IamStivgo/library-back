import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import { ENVS } from '@util';

export const middlewares = async (application: FastifyInstance): Promise<void> => {
    await application.register(helmet, {
        contentSecurityPolicy: false,
    });

    const allowedOrigins = ENVS.CORS_ORIGIN.split(',').map(origin => origin.trim());

    await application.register(cors, {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes('*') || allowedOrigins.some(allowed => origin.includes(allowed) || allowed === origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
    });

    await application.register(formbody);
};
