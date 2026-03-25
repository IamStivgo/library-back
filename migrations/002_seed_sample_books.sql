-- Insert sample books (skip if already exist)
INSERT INTO books (id, title, author, isbn, publisher, publication_year, genre, description, status)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Don Quixote', 'Miguel de Cervantes', '978-0-06-093451-3', 'HarperCollins', 1605, 'Novel', 'A Spanish novel by Miguel de Cervantes', 'checked-in'),
    ('550e8400-e29b-41d4-a716-446655440002', '1984', 'George Orwell', '978-0-452-28423-4', 'Signet Classic', 1949, 'Dystopian', 'A dystopian social science fiction novel', 'checked-in'),
    ('550e8400-e29b-41d4-a716-446655440003', 'To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'J. B. Lippincott', 1960, 'Fiction', 'A novel about racial injustice', 'checked-in'),
    ('550e8400-e29b-41d4-a716-446655440004', 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Scribner', 1925, 'Fiction', 'A novel about the American Dream', 'checked-in'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Penguin Classics', 1813, 'Romance', 'A romantic novel of manners', 'checked-in')
ON CONFLICT (id) DO NOTHING;
