import { DEPENDENCY_CONTAINER } from '../../configuration/DependencyContainer';
import { TYPES } from '../../configuration/Types';
import { LoanHistoryRepository } from '@domain/repository';
import { LoanHistoryEntity } from '@domain/entities/LoanHistory.entity';
import { Response, Result } from '@domain/response';
import { injectable } from 'inversify';

@injectable()
export class GetLoanHistoryService {
    private repository = DEPENDENCY_CONTAINER.get<LoanHistoryRepository>(TYPES.LoanHistoryRepository);

    async execute(borrowerEmail?: string): Promise<Response<LoanHistoryEntity[]>> {
        let loans: LoanHistoryEntity[];

        if (borrowerEmail) {
            loans = await this.repository.findByBorrowerEmail(borrowerEmail);
        } else {
            loans = await this.repository.findAll();
        }

        return Result.ok(loans, `Found ${loans.length} loan record(s)`);
    }
}
