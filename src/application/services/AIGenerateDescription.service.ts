import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { BookRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

export interface GenerateDescriptionInput {
    bookId: string;
}

@injectable()
export class AIGenerateDescriptionService {
    constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

    async execute(input: GenerateDescriptionInput): Promise<ServiceResult<{ description: string; bookId: string }>> {
        try {
            const book = await this.bookRepository.findById(input.bookId);

            if (!book) {
                return ServiceResult.fail(new AppError(ErrorCode.NOT_FOUND, 'Book not found'));
            }

            const description = await GeminiService.generateBookDescription(
                book.title,
                book.author,
                book.genre,
                book.description,
            );

            await this.bookRepository.update(book.id, {
                description,
            });

            return ServiceResult.ok({
                description,
                bookId: book.id,
            });
        } catch (error: any) {
            console.error('Generate description error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Description generation failed'));
        }
    }
}
