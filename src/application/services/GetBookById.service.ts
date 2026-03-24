import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class GetBookByIdService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(id: string): Promise<Response<BookEntity>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        return Result.ok(book, 'Book retrieved successfully');
    }
}
