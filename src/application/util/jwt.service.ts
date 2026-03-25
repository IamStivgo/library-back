import jwt, { SignOptions } from 'jsonwebtoken';
import { ENVS } from '@util';

export interface TokenPayload {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
}

export class JwtService {
    private static readonly ACCESS_TOKEN_SECRET: string = (ENVS.JWT_SECRET ||
        'your-secret-key-change-in-production') as string;
    private static readonly REFRESH_TOKEN_SECRET: string = (ENVS.JWT_REFRESH_SECRET ||
        'your-refresh-secret-key-change-in-production') as string;
    private static readonly ACCESS_TOKEN_EXPIRY: string = (ENVS.JWT_EXPIRY || '15m') as string;
    private static readonly REFRESH_TOKEN_EXPIRY: string = (ENVS.JWT_REFRESH_EXPIRY || '7d') as string;

    static generateAccessToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.ACCESS_TOKEN_EXPIRY as any,
        };
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
    }

    static generateRefreshToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.REFRESH_TOKEN_EXPIRY as any,
        };
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
    }

    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    static verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    static getTokenExpiry(token: string): Date | null {
        try {
            const decoded = jwt.decode(token) as any;
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
