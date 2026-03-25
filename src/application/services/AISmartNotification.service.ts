import { injectable } from 'inversify';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

export interface SmartNotificationInput {
    userName: string;
    notificationType:
        | 'new_recommendation'
        | 'overdue_reminder'
        | 'new_arrival'
        | 'reading_milestone'
        | 'personalized_insight';
    data: Record<string, any>;
}

@injectable()
export class AISmartNotificationService {
    async execute(input: SmartNotificationInput): Promise<ServiceResult<{ title: string; message: string }>> {
        try {
            const notification = await GeminiService.generateSmartNotification({
                userName: input.userName,
                notificationType: input.notificationType,
                data: input.data,
            });

            return ServiceResult.ok(notification);
        } catch (error: any) {
            console.error('Smart notification error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Smart notification generation failed'));
        }
    }
}
