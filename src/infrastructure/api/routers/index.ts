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
} from './Book.routes';

export const initRoutes = async (application: FastifyInstance): Promise<void> => {
    application.get('/healthcheck', HealthCheckRoute);

    application.get('/books', getAllBooksRoute);
    application.get('/books/search', searchBooksRoute);
    application.get('/books/:id', getBookByIdRoute);
    application.post('/books', createBookRoute);
    application.put('/books/:id', updateBookRoute);
    application.delete('/books/:id', deleteBookRoute);

    application.post('/books/:id/checkout', checkOutBookRoute);
    application.post('/books/:id/checkin', checkInBookRoute);
};
