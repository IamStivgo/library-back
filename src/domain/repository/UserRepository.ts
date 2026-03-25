import { UserEntity, CreateUserInput, UpdateUserInput } from '@domain/entities/UserEntity';
import { UserWithRoles } from '@domain/entities/RoleEntity';
import { ServiceResult } from '@domain/response';

export interface UserRepository {
    create(input: CreateUserInput): Promise<ServiceResult<UserEntity>>;
    findById(id: string): Promise<ServiceResult<UserEntity | null>>;
    findByEmail(email: string): Promise<ServiceResult<UserEntity | null>>;
    findByGoogleId(googleId: string): Promise<ServiceResult<UserEntity | null>>;
    findByMicrosoftId(microsoftId: string): Promise<ServiceResult<UserEntity | null>>;
    findByGitHubId(githubId: string): Promise<ServiceResult<UserEntity | null>>;
    findByUsername(username: string): Promise<ServiceResult<UserEntity | null>>;
    update(id: string, input: UpdateUserInput): Promise<ServiceResult<UserEntity>>;
    delete(id: string): Promise<ServiceResult<boolean>>;
    getUserWithRoles(userId: string): Promise<ServiceResult<UserWithRoles | null>>;
    assignRole(userId: string, roleId: string): Promise<ServiceResult<boolean>>;
    removeRole(userId: string, roleId: string): Promise<ServiceResult<boolean>>;
    updateLastLogin(userId: string): Promise<ServiceResult<boolean>>;
    findAll(limit?: number, offset?: number): Promise<ServiceResult<UserEntity[]>>;
}
