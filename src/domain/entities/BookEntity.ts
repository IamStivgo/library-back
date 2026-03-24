export enum BookStatus {
    CHECKED_IN = 'checked-in',
    CHECKED_OUT = 'checked-out',
}

export interface BookEntity {
    id: string;
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    publicationYear?: number;
    genre?: string;
    description?: string;
    status: BookStatus;
    borrowerName?: string;
    borrowerEmail?: string;
    borrowDate?: Date;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
