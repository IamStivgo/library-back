import { RefreshTokenEntity } from '@domain/entities/RefreshTokenEntity';
import { ServiceResult } from '@domain/response';

export interface AuthRepository {
    saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<ServiceResult<RefreshTokenEntity>>;
    findRefreshToken(token: string): Promise<ServiceResult<RefreshTokenEntity | null>>;
    revokeRefreshToken(token: string): Promise<ServiceResult<boolean>>;
    revokeAllUserTokens(userId: string): Promise<ServiceResult<boolean>>;
    deleteExpiredTokens(): Promise<ServiceResult<number>>;
}
