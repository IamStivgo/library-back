import Joi from 'joi';

export const createBookSchema = Joi.object({
    title: Joi.string().required().min(1).max(255),
    author: Joi.string().required().min(1).max(255),
    isbn: Joi.string().required().min(10).max(17),
    publisher: Joi.string().optional().max(255),
    publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    genre: Joi.string().optional().max(100),
    description: Joi.string().optional().max(1000),
    status: Joi.string().valid('checked-in', 'checked-out').optional().default('checked-in'),
    id: Joi.string().optional(),
    borrowerName: Joi.string().optional(),
    borrowerEmail: Joi.string().optional(),
    borrowDate: Joi.string().optional(),
    dueDate: Joi.string().optional(),
    createdAt: Joi.string().optional(),
    updatedAt: Joi.string().optional(),
}).unknown(false);

export const updateBookSchema = Joi.object({
    title: Joi.string().optional().min(1).max(255),
    author: Joi.string().optional().min(1).max(255),
    isbn: Joi.string().optional().min(10).max(17),
    publisher: Joi.string().optional().max(255),
    publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    genre: Joi.string().optional().max(100),
    description: Joi.string().optional().max(1000),
    status: Joi.string().valid('checked-in', 'checked-out').optional(),
    id: Joi.string().optional(),
    borrowerName: Joi.string().optional(),
    borrowerEmail: Joi.string().optional(),
    borrowDate: Joi.string().optional(),
    dueDate: Joi.string().optional(),
    createdAt: Joi.string().optional(),
    updatedAt: Joi.string().optional(),
}).unknown(false);

export const checkOutBookSchema = Joi.object({
    borrowerName: Joi.string().required().min(1).max(255),
    borrowerEmail: Joi.string().email().required(),
    dueDate: Joi.string().isoDate().required(),
});
