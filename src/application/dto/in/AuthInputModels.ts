export interface LoginInputModel {
    email: string;
    password: string;
}

export interface RegisterInputModel {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
}

export interface GoogleAuthInputModel {
    googleToken: string;
}

export interface RefreshTokenInputModel {
    refreshToken: string;
}
