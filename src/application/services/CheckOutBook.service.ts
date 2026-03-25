import { CheckOutBookInputModel } from '@application/dto';
import { DEPENDENCY_CONTAINER } from '../../configuration/DependencyContainer';
import { TYPES } from '../../configuration/Types';
import { BookRepository, LoanHistoryRepository } from '@domain/repository';
import { BookEntity, BookStatus, LoanStatus } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException, BadMessageException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class CheckOutBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);
    private loanHistoryRepository = DEPENDENCY_CONTAINER.get<LoanHistoryRepository>(TYPES.LoanHistoryRepository);

    async execute(id: string, dto: CheckOutBookInputModel): Promise<Response<BookEntity>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        if (book.status === BookStatus.CHECKED_OUT) {
            throw new BadMessageException('BOOK_ALREADY_CHECKED_OUT', `Book "${book.title}" is already checked out`);
        }

        const updates: Partial<BookEntity> = {
            status: BookStatus.CHECKED_OUT,
            borrowerName: dto.borrowerName,
            borrowerEmail: dto.borrowerEmail,
            borrowDate: new Date(),
            dueDate: new Date(dto.dueDate),
            updatedAt: new Date(),
        };

        await this.repository.update(id, updates);

        // Create loan history record
        await this.loanHistoryRepository.create({
            bookId: id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookIsbn: book.isbn,
            borrowerName: dto.borrowerName,
            borrowerEmail: dto.borrowerEmail,
            checkoutDate: new Date(),
            dueDate: new Date(dto.dueDate),
            status: LoanStatus.ACTIVE,
            renewedCount: 0,
        });

        const updatedBook = await this.repository.findById(id);
        return Result.ok(updatedBook!, `Book "${book.title}" checked out successfully`);
    }
}
