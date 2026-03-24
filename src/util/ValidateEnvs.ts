import Joi from 'joi';

export const validateEnvs = (): void => {
    const envVarsSchema = Joi.object({
        NODE_ENV: Joi.string().required(),
        PORT: Joi.number().default(5000),
        PREFIX_URL: Joi.string().default('/api'),
        HOST: Joi.string().default('0.0.0.0'),
        CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
    }).unknown();

    const { error } = envVarsSchema.validate(process.env);

    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }
};
