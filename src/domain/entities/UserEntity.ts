export interface UserEntity {
    id: string;
    email: string;
    username?: string;
    passwordHash?: string;
    fullName?: string;
    googleId?: string;
    microsoftId?: string;
    githubId?: string;
    avatarUrl?: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    email: string;
    username?: string;
    password?: string;
    fullName?: string;
    googleId?: string;
    microsoftId?: string;
    githubId?: string;
    avatarUrl?: string;
    emailVerified?: boolean;
}

export interface UpdateUserInput {
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    isActive?: boolean;
    emailVerified?: boolean;
}
