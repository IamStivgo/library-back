import { Pool } from 'pg';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../configuration/Types';
import { LoanHistoryRepository } from '@domain/repository';
import { LoanHistoryEntity, LoanStatus } from '@domain/entities/LoanHistory.entity';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class LoanHistoryPostgresRepository implements LoanHistoryRepository {
    constructor(@inject(TYPES.Database) private readonly pool: Pool) {}

    async create(loanHistory: Omit<LoanHistoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoanHistoryEntity> {
        const id = uuidv4();
        const query = `
            INSERT INTO loan_history (
                id, book_id, book_title, book_author, book_isbn,
                borrower_name, borrower_email, checkout_date, due_date,
                return_date, status, renewed_count, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            id,
            loanHistory.bookId,
            loanHistory.bookTitle,
            loanHistory.bookAuthor || null,
            loanHistory.bookIsbn || null,
            loanHistory.borrowerName,
            loanHistory.borrowerEmail,
            loanHistory.checkoutDate,
            loanHistory.dueDate,
            loanHistory.returnDate || null,
            loanHistory.status,
            loanHistory.renewedCount || 0,
            loanHistory.notes || null,
        ];

        const result = await this.pool.query(query, values);
        return this.mapToEntity(result.rows[0]);
    }

    async findById(id: string): Promise<LoanHistoryEntity | null> {
        const query = 'SELECT * FROM loan_history WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows.length > 0 ? this.mapToEntity(result.rows[0]) : null;
    }

    async findByBorrowerEmail(email: string): Promise<LoanHistoryEntity[]> {
        const query = `
            SELECT * FROM loan_history 
            WHERE borrower_email = $1 
            ORDER BY checkout_date DESC
        `;
        const result = await this.pool.query(query, [email]);
        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findByBookId(bookId: string): Promise<LoanHistoryEntity[]> {
        const query = `
            SELECT * FROM loan_history 
            WHERE book_id = $1 
            ORDER BY checkout_date DESC
        `;
        const result = await this.pool.query(query, [bookId]);
        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findAll(): Promise<LoanHistoryEntity[]> {
        const query = 'SELECT * FROM loan_history ORDER BY checkout_date DESC';
        const result = await this.pool.query(query);
        return result.rows.map((row) => this.mapToEntity(row));
    }

    async update(id: string, data: Partial<LoanHistoryEntity>): Promise<void> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id' && key !== 'createdAt') {
                const snakeKey = this.toSnakeCase(key);
                fields.push(`${snakeKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) return;

        values.push(id);
        const query = `UPDATE loan_history SET ${fields.join(', ')} WHERE id = $${paramCount}`;
        await this.pool.query(query, values);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM loan_history WHERE id = $1';
        await this.pool.query(query, [id]);
    }

    private mapToEntity(row: any): LoanHistoryEntity {
        return {
            id: row.id,
            bookId: row.book_id,
            bookTitle: row.book_title,
            bookAuthor: row.book_author,
            bookIsbn: row.book_isbn,
            borrowerName: row.borrower_name,
            borrowerEmail: row.borrower_email,
            checkoutDate: new Date(row.checkout_date),
            dueDate: new Date(row.due_date),
            returnDate: row.return_date ? new Date(row.return_date) : undefined,
            status: row.status as LoanStatus,
            renewedCount: row.renewed_count || 0,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }
}
