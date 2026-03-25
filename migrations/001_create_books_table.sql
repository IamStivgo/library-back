-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(17) NOT NULL,
    publisher VARCHAR(255),
    publication_year INTEGER,
    genre VARCHAR(100),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'checked-in',
    borrower_name VARCHAR(255),
    borrower_email VARCHAR(255),
    borrow_date TIMESTAMP,
    due_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on title for faster searches
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- Create index on author for faster searches
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Create index on isbn for faster searches
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Create index on status for faster filters
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

-- Create index on genre for faster filters
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
