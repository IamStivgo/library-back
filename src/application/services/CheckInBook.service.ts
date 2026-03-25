import { DEPENDENCY_CONTAINER } from '../../configuration/DependencyContainer';
import { TYPES } from '../../configuration/Types';
import { BookRepository, LoanHistoryRepository } from '@domain/repository';
import { BookEntity, BookStatus, LoanStatus, LoanHistoryEntity } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException, BadMessageException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class CheckInBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);
    private loanHistoryRepository = DEPENDENCY_CONTAINER.get<LoanHistoryRepository>(TYPES.LoanHistoryRepository);

    async execute(id: string): Promise<Response<BookEntity>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        if (book.status === BookStatus.CHECKED_IN) {
            throw new BadMessageException('BOOK_ALREADY_CHECKED_IN', `Book "${book.title}" is already checked in`);
        }

        // Update loan history to mark as returned
        const loanHistory = await this.loanHistoryRepository.findByBookId(id);
        const activeLoan = loanHistory.find((loan: LoanHistoryEntity) => loan.status === LoanStatus.ACTIVE);

        if (activeLoan) {
            await this.loanHistoryRepository.update(activeLoan.id, {
                returnDate: new Date(),
                status: LoanStatus.RETURNED,
            });
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
