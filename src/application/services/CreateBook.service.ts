import { CreateBookInputModel } from '@application/dto';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity, BookStatus } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CreateBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(dto: CreateBookInputModel): Promise<Response<BookEntity>> {
        const book = this.buildBookEntity(dto);
        await this.repository.save(book);

        return Result.ok(book, `Book "${book.title}" created successfully`);
    }

    private buildBookEntity(dto: CreateBookInputModel): BookEntity {
        return {
            id: uuidv4(),
            title: dto.title,
            author: dto.author,
            isbn: dto.isbn,
            publisher: dto.publisher,
            publicationYear: dto.publicationYear,
            genre: dto.genre,
            description: dto.description,
            status: dto.status === 'checked-out' ? BookStatus.CHECKED_OUT : BookStatus.CHECKED_IN,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
