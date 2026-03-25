import { injectable } from 'inversify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '@infrastructure/database';
import { AuthRepository } from '@domain/repository';
import { RefreshTokenEntity } from '@domain/entities/RefreshTokenEntity';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';

@injectable()
export class AuthPostgresRepository implements AuthRepository {
    private db: Pool = pool;

    async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<ServiceResult<RefreshTokenEntity>> {
        try {
            const id = uuidv4();
            const query = `
                INSERT INTO refresh_tokens (id, user_id, token, expires_at)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const result = await this.db.query(query, [id, userId, token, expiresAt]);
            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to save refresh token'));
        }
    }

    async findRefreshToken(token: string): Promise<ServiceResult<RefreshTokenEntity | null>> {
        try {
            const query = 'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false';
            const result = await this.db.query(query, [token]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find refresh token'));
        }
    }

    async revokeRefreshToken(token: string): Promise<ServiceResult<boolean>> {
        try {
            const query = 'UPDATE refresh_tokens SET revoked = true WHERE token = $1';
            const result = await this.db.query(query, [token]);

            return ServiceResult.ok(result.rowCount !== null && result.rowCount > 0);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to revoke refresh token'));
        }
    }

    async revokeAllUserTokens(userId: string): Promise<ServiceResult<boolean>> {
        try {
            const query = 'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1';
            await this.db.query(query, [userId]);

            return ServiceResult.ok(true);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to revoke user tokens'));
        }
    }

    async deleteExpiredTokens(): Promise<ServiceResult<number>> {
        try {
            const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
            const result = await this.db.query(query);

            return ServiceResult.ok(result.rowCount || 0);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete expired tokens'));
        }
    }

    private mapToEntity(row: any): RefreshTokenEntity {
        return {
            id: row.id,
            userId: row.user_id,
            token: row.token,
            expiresAt: new Date(row.expires_at),
            createdAt: new Date(row.created_at),
            revoked: row.revoked,
        };
    }
}
