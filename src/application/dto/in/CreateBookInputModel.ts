export interface CreateBookInputModel {
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    publicationYear?: number;
    genre?: string;
    description?: string;
    status?: 'checked-in' | 'checked-out';
}
