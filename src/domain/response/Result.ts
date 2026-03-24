import { Exception } from '@domain/exceptions';

export interface Response<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: Date;
}

export class Result {
    static ok<T>(data: T, message?: string): Response<T> {
        return {
            success: true,
            data: data,
            message: message,
            timestamp: new Date(),
        };
    }

    static failure<E = Exception>(exception: E): E {
        throw exception;
    }
}
