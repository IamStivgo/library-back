import { injectable } from 'inversify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { pool } from '@infrastructure/database';
import { UserRepository } from '@domain/repository';
import { UserEntity, CreateUserInput, UpdateUserInput } from '@domain/entities/UserEntity';
import { UserWithRoles, RoleEntity, PermissionEntity } from '@domain/entities/RoleEntity';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';

@injectable()
export class UserPostgresRepository implements UserRepository {
    private db: Pool = pool;

    async create(input: CreateUserInput): Promise<ServiceResult<UserEntity>> {
        try {
            const id = uuidv4();
            const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null;

            const query = `
                INSERT INTO users (
                    id, email, username, password_hash, full_name,
                    google_id, microsoft_id, github_id, avatar_url, is_active, email_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;

            const values = [
                id,
                input.email,
                input.username || null,
                passwordHash,
                input.fullName || null,
                input.googleId || null,
                input.microsoftId || null,
                input.githubId || null,
                input.avatarUrl || null,
                true,
                input.emailVerified || false,
            ];

            const result = await this.db.query(query, values);
            const user = this.mapToEntity(result.rows[0]);

            return ServiceResult.ok(user);
        } catch (error: any) {
            console.error('Error in create user:', error);
            if (error.code === '23505') {
                return ServiceResult.fail(
                    new AppError(ErrorCode.DUPLICATE_RESOURCE, 'User with this email already exists'),
                );
            }
            return ServiceResult.fail(
                new AppError(ErrorCode.INTERNAL_ERROR, `Failed to create user: ${error.message}`),
            );
        }
    }

    async findById(id: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await this.db.query(query, [id]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find user'));
        }
    }

    async findByEmail(email: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await this.db.query(query, [email]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error: any) {
            console.error('Error in findByEmail:', error);
            return ServiceResult.fail(
                new AppError(ErrorCode.INTERNAL_ERROR, `Failed to find user by email: ${error.message}`),
            );
        }
    }

    async findByGoogleId(googleId: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE google_id = $1';
            const result = await this.db.query(query, [googleId]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error: any) {
            console.error('Error in findByGoogleId:', error);
            return ServiceResult.fail(
                new AppError(ErrorCode.INTERNAL_ERROR, `Failed to find user by Google ID: ${error.message}`),
            );
        }
    }

    async findByMicrosoftId(microsoftId: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE microsoft_id = $1';
            const result = await this.db.query(query, [microsoftId]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find user'));
        }
    }

    async findByGitHubId(githubId: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE github_id = $1';
            const result = await this.db.query(query, [githubId]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find user'));
        }
    }

    async findByUsername(username: string): Promise<ServiceResult<UserEntity | null>> {
        try {
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await this.db.query(query, [username]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find user'));
        }
    }

    async update(id: string, input: UpdateUserInput): Promise<ServiceResult<UserEntity>> {
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(input).forEach(([key, value]) => {
                if (value !== undefined) {
                    const columnName = this.camelToSnake(key);
                    fields.push(`${columnName} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            if (fields.length === 0) {
                return this.findById(id).then((result) => {
                    if (result.isSuccess && result.value) {
                        return ServiceResult.ok(result.value);
                    }
                    return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'User not found'));
                });
            }

            fields.push(`updated_at = $${paramIndex}`);
            values.push(new Date());
            values.push(id);

            const query = `
                UPDATE users 
                SET ${fields.join(', ')} 
                WHERE id = $${paramIndex + 1}
                RETURNING *
            `;

            const result = await this.db.query(query, values);

            if (result.rows.length === 0) {
                return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'User not found'));
            }

            return ServiceResult.ok(this.mapToEntity(result.rows[0]));
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update user'));
        }
    }

    async delete(id: string): Promise<ServiceResult<boolean>> {
        try {
            const query = 'DELETE FROM users WHERE id = $1';
            const result = await this.db.query(query, [id]);

            return ServiceResult.ok(result.rowCount !== null && result.rowCount > 0);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete user'));
        }
    }

    async getUserWithRoles(userId: string): Promise<ServiceResult<UserWithRoles | null>> {
        try {
            const query = `
                SELECT 
                    u.id, u.email, u.username, u.full_name,
                    r.id as role_id, r.name as role_name, r.description as role_description,
                    r.created_at as role_created_at, r.updated_at as role_updated_at,
                    p.id as perm_id, p.name as perm_name, p.description as perm_description,
                    p.resource, p.action,
                    p.created_at as perm_created_at, p.updated_at as perm_updated_at
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = $1
            `;

            const result = await this.db.query(query, [userId]);

            if (result.rows.length === 0) {
                return ServiceResult.ok(null);
            }

            const firstRow = result.rows[0];
            const rolesMap = new Map<string, RoleEntity>();
            const permissionsMap = new Map<string, PermissionEntity>();

            result.rows.forEach((row) => {
                if (row.role_id && !rolesMap.has(row.role_id)) {
                    rolesMap.set(row.role_id, {
                        id: row.role_id,
                        name: row.role_name,
                        description: row.role_description,
                        createdAt: new Date(row.role_created_at),
                        updatedAt: new Date(row.role_updated_at),
                    });
                }

                if (row.perm_id && !permissionsMap.has(row.perm_id)) {
                    permissionsMap.set(row.perm_id, {
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

            const userWithRoles: UserWithRoles = {
                userId: firstRow.id,
                email: firstRow.email,
                username: firstRow.username,
                fullName: firstRow.full_name,
                roles: Array.from(rolesMap.values()),
                permissions: Array.from(permissionsMap.values()),
            };

            return ServiceResult.ok(userWithRoles);
        } catch (error: any) {
            console.error('Error in getUserWithRoles:', error);
            return ServiceResult.fail(
                new AppError(ErrorCode.INTERNAL_ERROR, `Failed to get user with roles: ${error.message}`),
            );
        }
    }

    async assignRole(userId: string, roleId: string): Promise<ServiceResult<boolean>> {
        try {
            const query = `
                INSERT INTO user_roles (user_id, role_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `;

            await this.db.query(query, [userId, roleId]);
            return ServiceResult.ok(true);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to assign role'));
        }
    }

    async removeRole(userId: string, roleId: string): Promise<ServiceResult<boolean>> {
        try {
            const query = 'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2';
            const result = await this.db.query(query, [userId, roleId]);

            return ServiceResult.ok(result.rowCount !== null && result.rowCount > 0);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to remove role'));
        }
    }

    async updateLastLogin(userId: string): Promise<ServiceResult<boolean>> {
        try {
            const query = 'UPDATE users SET last_login = $1 WHERE id = $2';
            await this.db.query(query, [new Date(), userId]);

            return ServiceResult.ok(true);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update last login'));
        }
    }

    async findAll(limit = 50, offset = 0): Promise<ServiceResult<UserEntity[]>> {
        try {
            const query = `
                SELECT * FROM users
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;

            const result = await this.db.query(query, [limit, offset]);
            const users = result.rows.map((row) => this.mapToEntity(row));

            return ServiceResult.ok(users);
        } catch (error) {
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to find users'));
        }
    }

    private mapToEntity(row: any): UserEntity {
        return {
            id: row.id,
            email: row.email,
            username: row.username || undefined,
            passwordHash: row.password_hash || undefined,
            fullName: row.full_name || undefined,
            googleId: row.google_id || undefined,
            microsoftId: row.microsoft_id || undefined,
            githubId: row.github_id || undefined,
            avatarUrl: row.avatar_url || undefined,
            isActive: row.is_active,
            emailVerified: row.email_verified,
            lastLogin: row.last_login ? new Date(row.last_login) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    private camelToSnake(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }
}
