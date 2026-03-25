export interface AuditLogEntity {
    id: string;
    userId?: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure' | 'warning';
    errorMessage?: string;
    createdAt: Date;
}

export interface CreateAuditLogInput {
    userId?: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure' | 'warning';
    errorMessage?: string;
}

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    resource?: string;
    status?: 'success' | 'failure' | 'warning';
    startDate?: Date;
    endDate?: Date;
}
