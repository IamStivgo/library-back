import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { injectable } from 'inversify';

@injectable()
export class SearchBooksService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(query: string): Promise<Response<BookEntity[]>> {
        const books = await this.repository.search(query);
        return Result.ok(books, `Found ${books.length} book(s)`);
    }
}
