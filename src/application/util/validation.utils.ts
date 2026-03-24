import Joi from 'joi';

export const validateData = <T>(schema: Joi.ObjectSchema, data: unknown): T => {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        throw new Error(`Validation error: ${errorMessage}`);
    }

    return value as T;
};
