import { injectable } from 'inversify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '@infrastructure/database';
import { AuditLogRepository } from '@domain/repository/AuditLogRepository';
import { AuditLogEntity, CreateAuditLogInput, AuditLogFilters } from '@domain/entities/AuditLogEntity';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';

@injectable()
export class AuditLogPostgresRepository implements AuditLogRepository {
    private db: Pool = pool;

    async create(input: CreateAuditLogInput): Promise<ServiceResult<AuditLogEntity>> {
        try {
            const id = uuidv4();

            const query = `
                INSERT INTO audit_logs (
                    id, user_id, user_email, action, resource, resource_id,
                    details, ip_address, user_agent, status, error_message
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;

            const values = [
                id,
                input.userId || null,
                input.userEmail || null,
                input.action,
                input.resource,
                input.resourceId || null,
                input.details ? JSON.stringify(input.details) : null,
                input.ipAddress || null,
                input.userAgent || null,
                input.status || 'success',
                input.errorMessage || null,
            ];

            const result = await this.db.query(query, values);
            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error: any) {
            console.error('Failed to create audit log:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to create audit log'));
        }
    }

    async findById(id: string): Promise<ServiceResult<AuditLogEntity | null>> {
        try {
            const query = 'SELECT * FROM audit_logs WHERE id = $1';
            const result = await this.db.query(query, [id]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find audit log'));
        }
    }

    async findByFilters(
        filters: AuditLogFilters,
        limit = 50,
        offset = 0,
    ): Promise<ServiceResult<{ logs: AuditLogEntity[]; total: number }>> {
        try {
            const conditions: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (filters.userId) {
                conditions.push(`user_id = $${paramIndex}`);
                values.push(filters.userId);
                paramIndex++;
            }

            if (filters.action) {
                conditions.push(`action = $${paramIndex}`);
                values.push(filters.action);
                paramIndex++;
            }

            if (filters.resource) {
                conditions.push(`resource = $${paramIndex}`);
                values.push(filters.resource);
                paramIndex++;
            }

            if (filters.status) {
                conditions.push(`status = $${paramIndex}`);
                values.push(filters.status);
                paramIndex++;
            }

            if (filters.startDate) {
                conditions.push(`created_at >= $${paramIndex}`);
                values.push(filters.startDate);
                paramIndex++;
            }

            if (filters.endDate) {
                conditions.push(`created_at <= $${paramIndex}`);
                values.push(filters.endDate);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
            const countResult = await this.db.query(countQuery, values);
            const total = parseInt(countResult.rows[0].total);

            const query = `
                SELECT * FROM audit_logs
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            values.push(limit, offset);
            const result = await this.db.query(query, values);
            const logs = result.rows.map((row) => this.mapToEntity(row));

            return ServiceResult.ok({ logs, total });
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find audit logs'));
        }
    }

    async findByUserId(userId: string, limit = 50, offset = 0): Promise<ServiceResult<AuditLogEntity[]>> {
        try {
            const query = `
                SELECT * FROM audit_logs
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            `;

            const result = await this.db.query(query, [userId, limit, offset]);
            const logs = result.rows.map((row) => this.mapToEntity(row));

            return ServiceResult.ok(logs);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find audit logs'));
        }
    }

    async deleteOlderThan(date: Date): Promise<ServiceResult<number>> {
        try {
            const query = 'DELETE FROM audit_logs WHERE created_at < $1';
            const result = await this.db.query(query, [date]);

            return ServiceResult.ok(result.rowCount || 0);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete audit logs'));
        }
    }

    private mapToEntity(row: any): AuditLogEntity {
        return {
            id: row.id,
            userId: row.user_id || undefined,
            userEmail: row.user_email || undefined,
            action: row.action,
            resource: row.resource,
            resourceId: row.resource_id || undefined,
            details: row.details ? JSON.parse(row.details) : undefined,
            ipAddress: row.ip_address || undefined,
            userAgent: row.user_agent || undefined,
            status: row.status,
            errorMessage: row.error_message || undefined,
            createdAt: new Date(row.created_at),
        };
    }
}
