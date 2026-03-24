import Joi from 'joi';
import { ValidationException } from '@domain/exceptions';

export const validateData = <T>(schema: Joi.ObjectSchema, data: unknown): T => {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        throw new ValidationException(errorMessage);
    }

    return value as T;
};
