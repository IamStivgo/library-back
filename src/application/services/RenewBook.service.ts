import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity, BookStatus } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException, BadMessageException } from '@domain/exceptions';
import { injectable } from 'inversify';

export interface RenewBookInput {
    dueDate: string;
}

@injectable()
export class RenewBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(id: string, dueDate: string): Promise<Response<BookEntity>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        if (book.status !== BookStatus.CHECKED_OUT) {
            throw new BadMessageException('BOOK_NOT_CHECKED_OUT', `Book "${book.title}" is not currently checked out`);
        }

        const updates: Partial<BookEntity> = {
            dueDate: new Date(dueDate),
            updatedAt: new Date(),
        };

        await this.repository.update(id, updates);

        const updatedBook = await this.repository.findById(id);
        return Result.ok(updatedBook!, `Book "${book.title}" renewed successfully`);
    }
}
