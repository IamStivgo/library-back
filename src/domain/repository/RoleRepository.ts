import { RoleEntity, PermissionEntity, RoleWithPermissions } from '@domain/entities/RoleEntity';
import { ServiceResult } from '@domain/response';

export interface RoleRepository {
    findById(id: string): Promise<ServiceResult<RoleEntity | null>>;
    findByName(name: string): Promise<ServiceResult<RoleEntity | null>>;
    findAll(): Promise<ServiceResult<RoleEntity[]>>;
    getRoleWithPermissions(roleId: string): Promise<ServiceResult<RoleWithPermissions | null>>;
    getUserPermissions(userId: string): Promise<ServiceResult<PermissionEntity[]>>;
}
