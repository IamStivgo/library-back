import { BookRepository } from '@domain/repository';
import { BookEntity, BookStatus } from '@domain/entities';
import { Pool } from 'pg';
import { pool } from '@infrastructure/database';
import { injectable } from 'inversify';

@injectable()
export class BookPostgresRepository implements BookRepository {
    private db: Pool = pool;

    async save(book: BookEntity): Promise<void> {
        const query = `
            INSERT INTO books (
                id, title, author, isbn, publisher, publication_year,
                genre, description, status, borrower_name, borrower_email,
                borrow_date, due_date, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const values = [
            book.id,
            book.title,
            book.author,
            book.isbn,
            book.publisher || null,
            book.publicationYear || null,
            book.genre || null,
            book.description || null,
            book.status,
            book.borrowerName || null,
            book.borrowerEmail || null,
            book.borrowDate || null,
            book.dueDate || null,
            book.createdAt,
            book.updatedAt,
        ];

        await this.db.query(query, values);
    }

    async findById(id: string): Promise<BookEntity | null> {
        const query = 'SELECT * FROM books WHERE id = $1';
        const result = await this.db.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findAll(): Promise<BookEntity[]> {
        const query = 'SELECT * FROM books ORDER BY created_at DESC';
        const result = await this.db.query(query);

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async update(id: string, updates: Partial<BookEntity>): Promise<void> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const { updatedAt, createdAt, ...editableUpdates } = updates;

        Object.entries(editableUpdates).forEach(([key, value]) => {
            if (value !== undefined) {
                const columnName = this.camelToSnake(key);
                fields.push(`${columnName} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            return;
        }

        fields.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        values.push(id);

        const query = `UPDATE books SET ${fields.join(', ')} WHERE id = $${paramIndex + 1}`;

        await this.db.query(query, values);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM books WHERE id = $1';
        await this.db.query(query, [id]);
    }

    async search(query: string): Promise<BookEntity[]> {
        const searchQuery = `
            SELECT * FROM books
            WHERE 
                LOWER(title) LIKE LOWER($1) OR
                LOWER(author) LIKE LOWER($1) OR
                LOWER(isbn) LIKE LOWER($1) OR
                LOWER(genre) LIKE LOWER($1) OR
                LOWER(publisher) LIKE LOWER($1)
            ORDER BY created_at DESC
        `;

        const searchPattern = `%${query}%`;
        const result = await this.db.query(searchQuery, [searchPattern]);

        return result.rows.map((row) => this.mapToEntity(row));
    }

    private mapToEntity(row: any): BookEntity {
        return {
            id: row.id,
            title: row.title,
            author: row.author,
            isbn: row.isbn,
            publisher: row.publisher || undefined,
            publicationYear: row.publication_year || undefined,
            genre: row.genre || undefined,
            description: row.description || undefined,
            status: row.status as BookStatus,
            borrowerName: row.borrower_name || undefined,
            borrowerEmail: row.borrower_email || undefined,
            borrowDate: row.borrow_date ? new Date(row.borrow_date) : undefined,
            dueDate: row.due_date ? new Date(row.due_date) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    private camelToSnake(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }
}
