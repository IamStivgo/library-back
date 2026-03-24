import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity, BookStatus } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException, BadMessageException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class CheckInBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(id: string): Promise<Response<BookEntity>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        if (book.status === BookStatus.CHECKED_IN) {
            throw new BadMessageException('BOOK_ALREADY_CHECKED_IN', `Book "${book.title}" is already checked in`);
        }

        const updates: Partial<BookEntity> = {
            status: BookStatus.CHECKED_IN,
            borrowerName: undefined,
            borrowerEmail: undefined,
            borrowDate: undefined,
            dueDate: undefined,
            updatedAt: new Date(),
        };

        await this.repository.update(id, updates);

        const updatedBook = await this.repository.findById(id);
        return Result.ok(updatedBook!, `Book "${book.title}" checked in successfully`);
    }
}
