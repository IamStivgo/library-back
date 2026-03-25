import { FastifyInstance } from 'fastify';
import { HealthCheckRoute } from './HealthCheck.route';
import {
    createBookRoute,
    getAllBooksRoute,
    getBookByIdRoute,
    updateBookRoute,
    deleteBookRoute,
    checkOutBookRoute,
    checkInBookRoute,
    searchBooksRoute,
    renewBookRoute,
    getLoanHistoryRoute,
} from './Book.routes';
import { authRoutes } from './Auth.routes';
import { aiRoutes } from './AI.routes';
import { auditRoutes } from './Audit.routes';
import { authMiddleware, requirePermission, optionalAuth } from '../middlewares/AuthMiddleware';

export const initRoutes = async (application: FastifyInstance): Promise<void> => {
    application.get('/healthcheck', HealthCheckRoute);

    await application.register(authRoutes);
    await application.register(aiRoutes);
    await application.register(auditRoutes);

    application.get('/books', { preHandler: [optionalAuth] }, getAllBooksRoute as any);
    application.get('/books/search', { preHandler: [optionalAuth] }, searchBooksRoute as any);
    application.get('/books/:id', { preHandler: [optionalAuth] }, getBookByIdRoute as any);
    application.post(
        '/books',
        {
            preHandler: [authMiddleware, requirePermission('book:create')],
        },
        createBookRoute as any,
    );
    application.put(
        '/books/:id',
        {
            preHandler: [authMiddleware, requirePermission('book:update')],
        },
        updateBookRoute as any,
    );
    application.delete(
        '/books/:id',
        {
            preHandler: [authMiddleware, requirePermission('book:delete')],
        },
        deleteBookRoute as any,
    );

    application.post(
        '/books/:id/checkout',
        {
            preHandler: [authMiddleware, requirePermission('book:checkout')],
        },
        checkOutBookRoute as any,
    );
    application.post(
        '/books/:id/checkin',
        {
            preHandler: [authMiddleware, requirePermission('book:checkin')],
        },
        checkInBookRoute as any,
    );
    application.post(
        '/books/:id/renew',
        {
            preHandler: [authMiddleware, requirePermission('book:checkout')],
        },
        renewBookRoute as any,
    );
    application.get(
        '/loan-history',
        {
            preHandler: [authMiddleware],
        },
        getLoanHistoryRoute as any,
    );
};
