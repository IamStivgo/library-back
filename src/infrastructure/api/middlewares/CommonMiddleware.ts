import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formbody from '@fastify/formbody';
import { ENVS } from '@util';

export const middlewares = async (application: FastifyInstance): Promise<void> => {
    await application.register(helmet, {
        contentSecurityPolicy: false,
    });

    await application.register(cors, {
        origin: ENVS.CORS_ORIGIN,
        credentials: true,
    });

    await application.register(formbody);
};
