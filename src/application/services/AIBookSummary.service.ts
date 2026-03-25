import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { BookRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

@injectable()
export class AIBookSummaryService {
    constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

    async execute(bookId: string): Promise<ServiceResult<string>> {
        try {
            const book = await this.bookRepository.findById(bookId);

            if (!book) {
                return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'Book not found'));
            }

            const summary = await GeminiService.generateBookSummary(book.title, book.author, book.description);

            return ServiceResult.ok(summary);
        } catch (error: any) {
            console.error('AI Book Summary error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to generate book summary'));
        }
    }
}
