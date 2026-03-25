import { Exception, AppError } from '@domain/exceptions';

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

export class ServiceResult<T> {
    public readonly isSuccess: boolean;
    public readonly value?: T;
    public readonly error?: AppError;

    private constructor(isSuccess: boolean, value?: T, error?: AppError) {
        this.isSuccess = isSuccess;
        this.value = value;
        this.error = error;
    }

    static ok<T>(value: T): ServiceResult<T> {
        return new ServiceResult<T>(true, value, undefined);
    }

    static fail<T>(error: AppError): ServiceResult<T> {
        return new ServiceResult<T>(false, undefined, error);
    }
}
