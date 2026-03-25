import { AuditLogEntity, CreateAuditLogInput, AuditLogFilters } from '@domain/entities/AuditLogEntity';
import { ServiceResult } from '@domain/response';

export interface AuditLogRepository {
    create(input: CreateAuditLogInput): Promise<ServiceResult<AuditLogEntity>>;
    findById(id: string): Promise<ServiceResult<AuditLogEntity | null>>;
    findByFilters(
        filters: AuditLogFilters,
        limit?: number,
        offset?: number,
    ): Promise<ServiceResult<{ logs: AuditLogEntity[]; total: number }>>;
    findByUserId(userId: string, limit?: number, offset?: number): Promise<ServiceResult<AuditLogEntity[]>>;
    deleteOlderThan(date: Date): Promise<ServiceResult<number>>;
}
