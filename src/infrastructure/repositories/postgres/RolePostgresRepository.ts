import { injectable } from 'inversify';
import { Pool } from 'pg';
import { pool } from '@infrastructure/database';
import { RoleRepository } from '@domain/repository';
import { RoleEntity, PermissionEntity, RoleWithPermissions } from '@domain/entities/RoleEntity';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';

@injectable()
export class RolePostgresRepository implements RoleRepository {
    private db: Pool = pool;

    async findById(id: string): Promise<ServiceResult<RoleEntity | null>> {
        try {
            const query = 'SELECT * FROM roles WHERE id = $1';
            const result = await this.db.query(query, [id]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapRoleToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find role'));
        }
    }

    async findByName(name: string): Promise<ServiceResult<RoleEntity | null>> {
        try {
            const query = 'SELECT * FROM roles WHERE name = $1';
            const result = await this.db.query(query, [name]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapRoleToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find role'));
        }
    }

    async findAll(): Promise<ServiceResult<RoleEntity[]>> {
        try {
            const query = 'SELECT * FROM roles ORDER BY name';
            const result = await this.db.query(query);

            const roles = result.rows.map((row) => this.mapRoleToEntity(row));
            return ServiceResult.ok(roles);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find roles'));
        }
    }

    async getRoleWithPermissions(roleId: string): Promise<ServiceResult<RoleWithPermissions | null>> {
        try {
            const query = `
                SELECT 
                    r.id, r.name, r.description,
                    r.created_at as role_created_at, r.updated_at as role_updated_at,
                    p.id as perm_id, p.name as perm_name, p.description as perm_description,
                    p.resource, p.action,
                    p.created_at as perm_created_at, p.updated_at as perm_updated_at
                FROM roles r
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                WHERE r.id = $1
            `;

            const result = await this.db.query(query, [roleId]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            const firstRow = result.rows[0];
            const permissions: PermissionEntity[] = [];

            result.rows.forEach((row) => {
                if (row.perm_id) {
                    permissions.push({
                        id: row.perm_id,
                        name: row.perm_name,
                        description: row.perm_description,
                        resource: row.resource,
                        action: row.action,
                        createdAt: new Date(row.perm_created_at),
                        updatedAt: new Date(row.perm_updated_at),
                    });
                }
            });

            const roleWithPermissions: RoleWithPermissions = {
                id: firstRow.id,
                name: firstRow.name,
                description: firstRow.description,
                createdAt: new Date(firstRow.role_created_at),
                updatedAt: new Date(firstRow.role_updated_at),
                permissions,
            };

            return ServiceResult.ok(roleWithPermissions);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get role with permissions'));
        }
    }

    async getUserPermissions(userId: string): Promise<ServiceResult<PermissionEntity[]>> {
        try {
            const query = `
                SELECT DISTINCT p.*
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                INNER JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = $1
                ORDER BY p.resource, p.action
            `;

            const result = await this.db.query(query, [userId]);
            const permissions = result.rows.map((row) => this.mapPermissionToEntity(row));

            return ServiceResult.ok(permissions);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get user permissions'));
        }
    }

    private mapRoleToEntity(row: any): RoleEntity {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    private mapPermissionToEntity(row: any): PermissionEntity {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            resource: row.resource,
            action: row.action,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
