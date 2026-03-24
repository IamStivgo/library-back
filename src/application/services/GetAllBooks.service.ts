import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { injectable } from 'inversify';

@injectable()
export class GetAllBooksService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(): Promise<Response<BookEntity[]>> {
        const books = await this.repository.findAll();
        return Result.ok(books, 'Books retrieved successfully');
    }
}
