import { IsNumberString, IsMongoId, IsEnum } from 'class-validator';
import { HistorySort } from '@/config/constants';

export class FetchDto {
    @IsMongoId()
    courseId: string;

    @IsEnum(HistorySort)
    sort: HistorySort
    
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}