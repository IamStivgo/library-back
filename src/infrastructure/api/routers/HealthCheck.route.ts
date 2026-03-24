import { FastifyRequest, FastifyReply } from 'fastify';

export const HealthCheckRoute = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    return reply.status(200).send({
        success: true,
        message: 'Library Management API is running',
        timestamp: new Date(),
    });
};
