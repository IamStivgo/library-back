export interface LoanHistoryEntity {
    id: string;
    bookId: string;
    bookTitle: string;
    bookAuthor?: string;
    bookIsbn?: string;
    borrowerName: string;
    borrowerEmail: string;
    checkoutDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: LoanStatus;
    renewedCount: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum LoanStatus {
    ACTIVE = 'active',
    RETURNED = 'returned',
    OVERDUE = 'overdue',
}
