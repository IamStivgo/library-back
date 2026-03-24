import { UpdateBookInputModel } from '@application/dto';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { BookRepository } from '@domain/repository';
import { BookEntity } from '@domain/entities';
import { Response, Result } from '@domain/response';
import { NotFoundException } from '@domain/exceptions';
import { injectable } from 'inversify';

@injectable()
export class UpdateBookService {
    private repository = DEPENDENCY_CONTAINER.get<BookRepository>(TYPES.BookRepository);

    async execute(id: string, dto: UpdateBookInputModel): Promise<Response<BookEntity>> {
        const existingBook = await this.repository.findById(id);

        if (!existingBook) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        // Solo actualizar campos editables, excluir campos del sistema
        const updates: Partial<BookEntity> = {};

        if (dto.title !== undefined) updates.title = dto.title;
        if (dto.author !== undefined) updates.author = dto.author;
        if (dto.isbn !== undefined) updates.isbn = dto.isbn;
        if (dto.publisher !== undefined) updates.publisher = dto.publisher;
        if (dto.publicationYear !== undefined) updates.publicationYear = dto.publicationYear;
        if (dto.genre !== undefined) updates.genre = dto.genre;
        if (dto.description !== undefined) updates.description = dto.description;

        // Agregar timestamp de actualización
        updates.updatedAt = new Date();

        await this.repository.update(id, updates);

        const updatedBook = await this.repository.findById(id);
        return Result.ok(updatedBook!, `Book "${updatedBook!.title}" updated successfully`);
    }
}
