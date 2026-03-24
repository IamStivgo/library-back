import { BookEntity } from '@domain/entities';

export interface BookRepository {
    save(book: BookEntity): Promise<void>;
    findById(id: string): Promise<BookEntity | null>;
    findAll(): Promise<BookEntity[]>;
    update(id: string, book: Partial<BookEntity>): Promise<void>;
    delete(id: string): Promise<void>;
    search(query: string): Promise<BookEntity[]>;
}
