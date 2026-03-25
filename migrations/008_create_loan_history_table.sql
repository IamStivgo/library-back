-- Create loan_history table to track all book borrowing activities
CREATE TABLE IF NOT EXISTS loan_history (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(36) NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    book_title VARCHAR(500) NOT NULL,
    book_author VARCHAR(300),
    book_isbn VARCHAR(20),
    borrower_name VARCHAR(255) NOT NULL,
    borrower_email VARCHAR(255) NOT NULL,
    checkout_date TIMESTAMP NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, returned, overdue
    renewed_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_loan_history_book_id ON loan_history(book_id);
CREATE INDEX IF NOT EXISTS idx_loan_history_borrower_email ON loan_history(borrower_email);
CREATE INDEX IF NOT EXISTS idx_loan_history_status ON loan_history(status);
CREATE INDEX IF NOT EXISTS idx_loan_history_checkout_date ON loan_history(checkout_date DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loan_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loan_history_updated_at
    BEFORE UPDATE ON loan_history
    FOR EACH ROW
    EXECUTE FUNCTION update_loan_history_timestamp();

-- Migrate existing checked out books to loan_history
INSERT INTO loan_history (
    book_id,
    book_title,
    book_author,
    book_isbn,
    borrower_name,
    borrower_email,
    checkout_date,
    due_date,
    status
)
SELECT 
    id,
    title,
    author,
    isbn,
    borrower_name,
    borrower_email,
    COALESCE(borrow_date, NOW()),
    COALESCE(due_date, NOW() + INTERVAL '14 days'),
    'active'
FROM books
WHERE status = 'checked-out'
AND borrower_email IS NOT NULL
ON CONFLICT DO NOTHING;
