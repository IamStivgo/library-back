import { injectable } from 'inversify';
import { ServiceResult } from '@domain/response';
import { AppError, ErrorCode } from '@domain/exceptions';
import { GeminiService } from '@application/util/gemini.service';

export interface ReadingTrendsInput {
    checkoutHistory: Array<{
        bookTitle: string;
        bookAuthor: string;
        bookGenre?: string;
        checkoutDate: string;
        returnDate?: string;
    }>;
}

@injectable()
export class AIReadingTrendsService {
    async execute(input: ReadingTrendsInput): Promise<ServiceResult<{ analysis: string }>> {
        try {
            if (!input.checkoutHistory || input.checkoutHistory.length === 0) {
                return ServiceResult.fail(new AppError(ErrorCode.BAD_REQUEST, 'No checkout history provided'));
            }

            const historyData = input.checkoutHistory.map((item) => ({
                bookTitle: item.bookTitle,
                bookAuthor: item.bookAuthor,
                bookGenre: item.bookGenre,
                checkoutDate: new Date(item.checkoutDate),
                returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
            }));

            const analysis = await GeminiService.analyzeReadingTrends(historyData);

            return ServiceResult.ok({ analysis });
        } catch (error: any) {
            console.error('Reading trends analysis error:', error);
            return ServiceResult.fail(new AppError(ErrorCode.INTERNAL_ERROR, 'Reading trends analysis failed'));
        }
    }
}
