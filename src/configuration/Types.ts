export const TYPES = {
    Database: Symbol.for('Database'),
    BookRepository: Symbol.for('BookRepository'),
};

export type EnvType = Readonly<{
    NODE_ENV: string;
    PREFIX_URL: string;
    HOST: string;
    PORT: string;
    CORS_ORIGIN: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
}>;
