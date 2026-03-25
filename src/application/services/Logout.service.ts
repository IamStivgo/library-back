import { injectable, inject } from 'inversify';
import { TYPES } from '@configuration/Types';
import { AuthRepository } from '@domain/repository';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';

@injectable()
export class LogoutService {
    constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}

    async execute(refreshToken: string): Promise<ServiceResult<boolean>> {
        const result = await this.authRepository.revokeRefreshToken(refreshToken);

        if (!result.isSuccess) {
            return ServiceResult.fail(result.error!);
        }

        return ServiceResult.ok(true);
    }

    async logoutAllDevices(userId: string): Promise<ServiceResult<boolean>> {
        const result = await this.authRepository.revokeAllUserTokens(userId);

        if (!result.isSuccess) {
            return ServiceResult.fail(result.error!);
        }

        return ServiceResult.ok(true);
    }
}
