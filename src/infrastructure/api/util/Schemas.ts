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

export const validateRequest = <T>(schema: Joi.ObjectSchema, data: unknown) => {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return {
            isValid: false,
            errors,
            data: null as T | null,
        };
    }

    return {
        isValid: true,
        errors: [],
        data: value as T,
    };
};
