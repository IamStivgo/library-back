import Joi from 'joi';

export const chatSchema = Joi.object({
    messages: Joi.array()
        .items(
            Joi.object({
                role: Joi.string().valid('user', 'assistant').required(),
                content: Joi.string().required(),
            }),
        )
        .min(1)
        .required(),
    includeBookContext: Joi.boolean().optional().default(false),
});

export const recommendationsSchema = Joi.object({
    favoriteGenres: Joi.array().items(Joi.string()).optional(),
    favoriteAuthors: Joi.array().items(Joi.string()).optional(),
    recentReads: Joi.array().items(Joi.string()).optional(),
    interests: Joi.array().items(Joi.string()).optional(),
});
