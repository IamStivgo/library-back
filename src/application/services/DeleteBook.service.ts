import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { Response, Result } from '@domain/response';
import { NotFoundException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class DeleteBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(id: string): Promise<Response<{ message: string }>> {
        const book = await this.repository.findById(id);

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        await this.repository.delete(id);

        return Result.ok({ message: `Book "${book.title}" deleted successfully` });
    }
}
