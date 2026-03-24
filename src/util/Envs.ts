import { EnvType } from '@configuration/Types';

export const ENVS: EnvType = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PREFIX_URL: process.env.PREFIX_URL ?? '/api',
    HOST: process.env.HOST ?? '0.0.0.0',
    PORT: process.env.PORT ?? '5000',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: process.env.DB_PORT ?? '5432',
    DB_NAME: process.env.DB_NAME ?? 'library_db',
    DB_USER: process.env.DB_USER ?? 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
};
