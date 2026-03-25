export interface RoleEntity {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PermissionEntity {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoleWithPermissions extends RoleEntity {
    permissions: PermissionEntity[];
}

export interface UserWithRoles {
    userId: string;
    email: string;
    username?: string;
    fullName?: string;
    roles: RoleEntity[];
    permissions: PermissionEntity[];
}
