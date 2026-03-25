import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { AuditLogRepository } from '@domain/repository/AuditLogRepository';
import { AuditLogFilters } from '@domain/entities/AuditLogEntity';
import { ServiceResult } from '@domain/response';

export interface GetAuditLogsInput {
    filters?: AuditLogFilters;
    limit?: number;
    offset?: number;
}

@injectable()
export class GetAuditLogsService {
    constructor(@inject(TYPES.AuditLogRepository) private auditLogRepository: AuditLogRepository) {}

    async execute(input: GetAuditLogsInput) {
        return await this.auditLogRepository.findByFilters(input.filters || {}, input.limit || 50, input.offset || 0);
    }
}
