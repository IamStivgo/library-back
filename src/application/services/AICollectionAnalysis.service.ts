import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { BookRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

@injectable()
export class AICollectionAnalysisService {
    constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

    async execute(): Promise<ServiceResult<string>> {
        try {
            const books = await this.bookRepository.findAll();

            const booksData = books.map((book) => ({
                title: book.title,
                author: book.author,
                genre: book.genre,
                publicationYear: book.publicationYear,
            }));

            const analysis = await GeminiService.analyzeBookCollection(booksData);

            return ServiceResult.ok(analysis);
        } catch (error: any) {
            console.error('AI Collection Analysis error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to analyze collection'));
        }
    }
}
