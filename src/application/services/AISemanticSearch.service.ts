import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { BookRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

export interface SemanticSearchInput {
    query: string;
}

@injectable()
export class AISemanticSearchService {
    constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

    async execute(input: SemanticSearchInput) {
        try {
            const books = await this.bookRepository.findAll();

            const booksData = books.map((book) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                genre: book.genre,
            }));

            const searchResults = await GeminiService.semanticSearch(input.query, booksData);

            const enrichedResults = searchResults.map((result) => {
                const book = booksData.find((b) => b.id === result.bookId);
                return {
                    ...result,
                    book,
                };
            });

            return ServiceResult.ok({
                query: input.query,
                results: enrichedResults,
                totalResults: enrichedResults.length,
            });
        } catch (error: any) {
            console.error('Semantic search error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Semantic search failed'));
        }
    }
}
