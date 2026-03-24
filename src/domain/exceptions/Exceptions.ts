import { ErrorCode, StatusCode } from './ErrorCode';

export abstract class Exception {
    isError: boolean;
    message: string;
    code: ErrorCode;
    statusCode: number;
    cause: string | null;

    constructor(message: string, code: ErrorCode, statusCode: number, cause?: string) {
        this.isError = true;
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
        this.cause = cause ?? null;
    }
}

export class BadMessageException extends Exception {
    constructor(cause: string, message: string) {
        super(message, ErrorCode.BAD_MESSAGE, StatusCode.BAD_REQUEST, cause);
    }
}

export class NotFoundException extends Exception {
    constructor(message: string) {
        super(message, ErrorCode.NOT_FOUND, StatusCode.NOT_FOUND);
    }
}

export class ValidationException extends Exception {
    constructor(message: string) {
        super(message, ErrorCode.VALIDATION_ERROR, StatusCode.BAD_REQUEST);
    }
}

export class RepositoryException extends Exception {
    constructor(message: string) {
        super(message, ErrorCode.REPOSITORY_ERROR, StatusCode.INTERNAL_ERROR);
    }
}

export class DatabaseException extends Exception {
    constructor(message: string, cause?: string) {
        super(message, ErrorCode.REPOSITORY_ERROR, StatusCode.INTERNAL_ERROR, cause);
    }
}
