# 📚 Library Management System - Backend

Backend API for the Library Management System built with Hexagonal Architecture and PostgreSQL.

## 🎯 Core Features

### Main Functionality
- ✅ **Book Management**: Create, read, update, and delete books
- ✅ **Check-in/Check-out**: Mark books as borrowed or returned
- ✅ **Search**: Search books by title, author, ISBN, genre, or publisher
- ✅ **Validation**: Data validation with Joi
- ✅ **Error Handling**: Custom exception system

### Technical Features
- 🏗️ **Hexagonal Architecture**: Clean separation of layers (Domain, Application, Infrastructure)
- 🔌 **Dependency Injection**: With Inversify
- 🗄️ **Database**: PostgreSQL
- ⚡ **Framework**: Fastify (high performance)
- 🔒 **Security**: CORS and Helmet configured
- 📝 **TypeScript**: Strong typing and compile-time safety

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- PostgreSQL 12 or higher

### Installation

1. **Navigate to the project directory**
   ```bash
   cd back-libreria
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your values:
   ```env
   NODE_ENV=development
   PORT=5000
   PREFIX_URL=/api
   HOST=0.0.0.0
   
   # PostgreSQL Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=library_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   
   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Create and migrate the database**
   ```bash
   # Make sure PostgreSQL is running
   ./migrate.sh
   ```

   Or manually:
   ```bash
   createdb library_db
   psql -d library_db -f migrations/001_create_books_table.sql
   psql -d library_db -f migrations/002_seed_sample_books.sql
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Run in development mode**
   ```bash
   npm run dev
   ```

   Or in production:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:5000/api`

## 📋 API Endpoints

### Health Check
```http
GET /api/healthcheck
```
Verifies that the API is running correctly.

**Response (200):**
```json
{
  "success": true,
  "message": "Library Management API is running",
  "timestamp": "2024-03-24T10:00:00.000Z"
}
```

### Books

#### Get all books
```http
GET /api/books
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Don Quixote",
      "author": "Miguel de Cervantes",
      "isbn": "978-0-06-093451-3",
      "publisher": "HarperCollins",
      "publicationYear": 1605,
      "genre": "Novel",
      "description": "A Spanish novel by Miguel de Cervantes",
      "status": "checked-in",
      "createdAt": "2024-03-24T10:00:00.000Z",
      "updatedAt": "2024-03-24T10:00:00.000Z"
    }
  ],
  "message": "Books retrieved successfully",
  "timestamp": "2024-03-24T10:00:00.000Z"
}
```

#### Search books
```http
GET /api/books/search?q=query
```
Search books by title, author, ISBN, genre, or publisher.

**Query Parameters:**
- `q` (required): Search query string

#### Get a book by ID
```http
GET /api/books/:id
```

#### Create a book
```http
POST /api/books
Content-Type: application/json

{
  "title": "Don Quixote",
  "author": "Miguel de Cervantes",
  "isbn": "978-3-16-148410-0",
  "publisher": "Editorial Example",
  "publicationYear": 1605,
  "genre": "Novel",
  "description": "Book description"
}
```

**Successful Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "title": "Don Quixote",
    "author": "Miguel de Cervantes",
    "isbn": "978-3-16-148410-0",
    "status": "checked-in",
    "createdAt": "2024-03-24T10:00:00.000Z",
    "updatedAt": "2024-03-24T10:00:00.000Z"
  },
  "message": "Book \"Don Quixote\" created successfully",
  "timestamp": "2024-03-24T10:00:00.000Z"
}
```

#### Update a book
```http
PUT /api/books/:id
Content-Type: application/json

{
  "title": "New title",
  "description": "New description"
}
```

#### Delete a book
```http
DELETE /api/books/:id
```

#### Check-out (Borrow a book)
```http
POST /api/books/:id/checkout
Content-Type: application/json

{
  "borrowerName": "John Smith",
  "borrowerEmail": "john@example.com",
  "dueDate": "2024-04-24T10:00:00.000Z"
}
```

#### Check-in (Return a book)
```http
POST /api/books/:id/checkin
```

## 🏗️ Architecture

The project follows Hexagonal Architecture (Ports and Adapters):

```
src/
├── application/              # Use cases and application logic
│   ├── dto/                 # Data Transfer Objects
│   │   └── in/             # Input DTOs
│   ├── services/           # Application services
│   └── util/               # Application utilities
├── domain/                  # Pure business logic
│   ├── entities/           # Domain entities (BookEntity)
│   ├── exceptions/         # Custom exceptions
│   ├── repository/         # Repository interfaces (ports)
│   └── response/           # Response objects
├── infrastructure/         # Adapters and implementations
│   ├── api/               # REST API with Fastify
│   │   ├── middlewares/   # Middlewares (CORS, errors)
│   │   ├── routers/       # API routes
│   │   ├── schemas/       # Joi validation schemas
│   │   └── util/          # API utilities
│   ├── database/          # Database connection
│   └── repositories/      # Repository implementations
│       └── postgres/      # PostgreSQL repository
├── configuration/         # Configuration and dependency injection
└── util/                 # General utilities
```

### Layers and Responsibilities

1. **Domain**
   - Contains business entities (`BookEntity`)
   - Defines repository interfaces (ports)
   - Pure business logic with no external dependencies

2. **Application**
   - Implements system use cases
   - Orchestrates domain logic
   - Defines input and output DTOs

3. **Infrastructure**
   - Implements adapters (REST API, PostgreSQL)
   - Handles technical details (frameworks, databases)
   - Middlewares and validations

4. **Configuration**
   - Dependency injection with Inversify
   - Service and repository configuration

## 🗄️ Database Schema

### Books Table

```sql
CREATE TABLE books (
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
```

### Indexes
- `idx_books_title` on `title`
- `idx_books_author` on `author`
- `idx_books_isbn` on `isbn`
- `idx_books_status` on `status`
- `idx_books_genre` on `genre`

## 🛠️ Available Scripts

```bash
npm run dev          # Development mode with hot reload
npm run build        # Build for production
npm start            # Run in production
npm run lint         # Run linter
npm run format       # Format code with Prettier
npm test             # Run tests (when available)
```

## 📦 Data Model

### BookEntity

```typescript
{
  id: string;                    // Auto-generated UUID
  title: string;                 // Book title
  author: string;                // Book author
  isbn: string;                  // Book ISBN
  publisher?: string;            // Publisher (optional)
  publicationYear?: number;      // Publication year (optional)
  genre?: string;                // Genre (optional)
  description?: string;          // Description (optional)
  status: 'checked-in' | 'checked-out';  // Book status
  borrowerName?: string;         // Borrower name (if checked out)
  borrowerEmail?: string;        // Borrower email (if checked out)
  borrowDate?: Date;             // Borrow date (if checked out)
  dueDate?: Date;                // Due date (if checked out)
  createdAt: Date;               // Creation date
  updatedAt: Date;               // Last update date
}
```

## 🔐 Security

- **CORS**: Configured to accept requests from the frontend
- **Helmet**: HTTP header protection
- **Validation**: All input data is validated with Joi
- **Error Handling**: Robust exception handling system
- **SQL Injection**: Protected with parameterized queries

## 🧪 Testing

The project is set up for testing with Jest:

```bash
npm test           # Run tests
npm run coverage   # Test coverage
```

## 🌐 Frontend Integration

The backend is designed to work with the React frontend located at `../front-libreria`.

The response format is compatible with what the frontend expects:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}
```

## 🐳 Docker Support

### Build Docker image
```bash
docker build -t library-api .
```

### Run with Docker
```bash
docker run -p 5000:5000 --env-file .env library-api
```

### Docker Compose (recommended)
Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: library_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=library_db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up
```

## 📝 Important Notes

1. **Database**: The project uses PostgreSQL. Make sure PostgreSQL is running before starting the server.

2. **Migrations**: Run the migration script (`./migrate.sh`) to create the database schema and seed sample data.

3. **Environment Variables**: Make sure to configure environment variables correctly before running the project.

4. **IDs**: The backend uses UUIDs for book IDs. If the frontend expects numeric IDs, you can modify the `BookEntity` accordingly.

## 🚢 Deployment

### Heroku

1. Create a Heroku app
2. Add PostgreSQL addon
3. Push to Heroku:
   ```bash
   git push heroku main
   ```

### Railway / Render / DigitalOcean

The project can be deployed on any platform that supports Node.js and PostgreSQL:
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT

## 👨‍💻 Author

Developed with ❤️ for the Library Management System Challenge

---

**Ready to manage your library!** 📚🚀
