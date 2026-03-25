import { LoanHistoryEntity } from '../entities/LoanHistory.entity';

export interface LoanHistoryRepository {
    create(loanHistory: Omit<LoanHistoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoanHistoryEntity>;
    findById(id: string): Promise<LoanHistoryEntity | null>;
    findByBorrowerEmail(email: string): Promise<LoanHistoryEntity[]>;
    findByBookId(bookId: string): Promise<LoanHistoryEntity[]>;
    findAll(): Promise<LoanHistoryEntity[]>;
    update(id: string, data: Partial<LoanHistoryEntity>): Promise<void>;
    delete(id: string): Promise<void>;
}
