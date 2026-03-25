export const TYPES = {
    Database: Symbol.for('Database'),
    BookRepository: Symbol.for('BookRepository'),
    UserRepository: Symbol.for('UserRepository'),
    AuthRepository: Symbol.for('AuthRepository'),
    RoleRepository: Symbol.for('RoleRepository'),
    AuditLogRepository: Symbol.for('AuditLogRepository'),
    LoanHistoryRepository: Symbol.for('LoanHistoryRepository'),
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
    JWT_SECRET?: string;
    JWT_REFRESH_SECRET?: string;
    JWT_EXPIRY?: string;
    JWT_REFRESH_EXPIRY?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    MICROSOFT_CLIENT_ID?: string;
    MICROSOFT_CLIENT_SECRET?: string;
    MICROSOFT_TENANT_ID?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    GEMINI_API_KEY?: string;
}>;
