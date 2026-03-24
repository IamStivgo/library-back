import { Container } from 'inversify';
import { TYPES } from './Types';
import { pool } from '@infrastructure/database';
import { Pool } from 'pg';
import { BookPostgresRepository } from '@infrastructure/repositories/postgres/BookPostgresRepository';
import { CreateBookService } from '@application/services/CreateBook.service';
import { GetAllBooksService } from '@application/services/GetAllBooks.service';
import { GetBookByIdService } from '@application/services/GetBookById.service';
import { UpdateBookService } from '@application/services/UpdateBook.service';
import { DeleteBookService } from '@application/services/DeleteBook.service';
import { CheckOutBookService } from '@application/services/CheckOutBook.service';
import { CheckInBookService } from '@application/services/CheckInBook.service';
import { SearchBooksService } from '@application/services/SearchBooks.service';

export const DEPENDENCY_CONTAINER = new Container();

export const createDependencyContainer = (): void => {
    DEPENDENCY_CONTAINER.bind<Pool>(TYPES.Database).toConstantValue(pool);
    DEPENDENCY_CONTAINER.bind(TYPES.BookRepository).to(BookPostgresRepository).inSingletonScope();

    DEPENDENCY_CONTAINER.bind(CreateBookService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(GetAllBooksService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(GetBookByIdService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(UpdateBookService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(DeleteBookService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(CheckOutBookService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(CheckInBookService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(SearchBooksService).toSelf().inSingletonScope();
};
