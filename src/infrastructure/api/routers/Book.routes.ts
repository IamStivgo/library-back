import { FastifyRequest, FastifyReply } from 'fastify';
import { validateData } from '../util';
import { createBookSchema, updateBookSchema, checkOutBookSchema } from '../schemas';
import { DEPENDENCY_CONTAINER } from '@configuration';
import {
    CreateBookService,
    GetAllBooksService,
    GetBookByIdService,
    UpdateBookService,
    DeleteBookService,
    CheckOutBookService,
    CheckInBookService,
    SearchBooksService,
} from '@application/services';
import { CreateBookInputModel, UpdateBookInputModel, CheckOutBookInputModel } from '@application/dto';

export const createBookRoute = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const data = validateData<CreateBookInputModel>(createBookSchema, req.body);
    const service = DEPENDENCY_CONTAINER.get(CreateBookService);
    const result = await service.execute(data);
    return reply.status(201).send(result);
};

export const getAllBooksRoute = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const service = DEPENDENCY_CONTAINER.get(GetAllBooksService);
    const result = await service.execute();
    return reply.status(200).send(result);
};

export const getBookByIdRoute = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const service = DEPENDENCY_CONTAINER.get(GetBookByIdService);
    const result = await service.execute(req.params.id);
    return reply.status(200).send(result);
};

export const updateBookRoute = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const data = validateData<UpdateBookInputModel>(updateBookSchema, req.body);
    const service = DEPENDENCY_CONTAINER.get(UpdateBookService);
    const result = await service.execute(req.params.id, data);
    return reply.status(200).send(result);
};

export const deleteBookRoute = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const service = DEPENDENCY_CONTAINER.get(DeleteBookService);
    const result = await service.execute(req.params.id);
    return reply.status(200).send(result);
};

export const checkOutBookRoute = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const data = validateData<CheckOutBookInputModel>(checkOutBookSchema, req.body);
    const service = DEPENDENCY_CONTAINER.get(CheckOutBookService);
    const result = await service.execute(req.params.id, data);
    return reply.status(200).send(result);
};

export const checkInBookRoute = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const service = DEPENDENCY_CONTAINER.get(CheckInBookService);
    const result = await service.execute(req.params.id);
    return reply.status(200).send(result);
};

export const searchBooksRoute = async (
    req: FastifyRequest<{ Querystring: { q: string } }>,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const query = req.query.q || '';
    const service = DEPENDENCY_CONTAINER.get(SearchBooksService);
    const result = await service.execute(query);
    return reply.status(200).send(result);
};
