import 'reflect-metadata';
import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();
import fastify from 'fastify';
import { randomBytes } from 'crypto';
import { ENVS } from '@util';
import { initRoutes } from '@infrastructure/api/routers';
import { middlewares, errorHandler } from '@infrastructure/api/middlewares';

export const application = fastify({
    genReqId: (_) => randomBytes(20).toString('hex'),
    logger: {
        level: 'info',
    },
});

application.addHook('onRoute', (r) => {
    console.log(`Route: ${r.method} ${r.url}`);
});

middlewares(application);
errorHandler(application);

application.register(initRoutes, { prefix: ENVS.PREFIX_URL });
