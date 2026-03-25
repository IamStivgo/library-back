import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { BookRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService, ChatMessage } from '@application/util/gemini.service';

@injectable()
export class AIChatService {
    constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

    async execute(messages: ChatMessage[], includeBookContext = false): Promise<ServiceResult<string>> {
        try {
            let context =
                'You are a helpful library assistant. Help users find books, get recommendations, and answer questions about reading.';

            if (includeBookContext) {
                const books = await this.bookRepository.findAll();
                const booksList = books
                    .map((book) => `"${book.title}" by ${book.author} (${book.genre || 'Unknown genre'})`)
                    .slice(0, 50)
                    .join(', ');

                context += `\n\nAvailable books in the library include: ${booksList}`;
            }

            const response = await GeminiService.chat(messages, context);

            return ServiceResult.ok(response);
        } catch (error: any) {
            console.error('AI Chat error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to generate AI response'));
        }
    }
}
