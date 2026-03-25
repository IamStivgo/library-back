export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        username?: string;
        fullName?: string;
        avatarUrl?: string;
        roles: string[];
        permissions: string[];
    };
    tokens: AuthTokens;
}

export interface TokenPayload {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
}
