import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { AuditLogRepository } from '@domain/repository/AuditLogRepository';
import { CreateAuditLogInput } from '@domain/entities/AuditLogEntity';
import { ServiceResult } from '@domain/response';

@injectable()
export class AuditService {
    constructor(@inject(TYPES.AuditLogRepository) private auditLogRepository: AuditLogRepository) {}

    async log(input: CreateAuditLogInput): Promise<void> {
        try {
            await this.auditLogRepository.create(input);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    async logAction(
        action: string,
        resource: string,
        userId?: string,
        userEmail?: string,
        resourceId?: string,
        details?: Record<string, any>,
        status: 'success' | 'failure' | 'warning' = 'success',
        errorMessage?: string,
    ): Promise<void> {
        await this.log({
            userId,
            userEmail,
            action,
            resource,
            resourceId,
            details,
            status,
            errorMessage,
        });
    }
}
