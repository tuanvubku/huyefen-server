import { IsNumberString, IsMongoId, IsEnum } from 'class-validator';
import { HistorySort } from '@/config/constants';

export class FetchHistoriesDto {

    @IsEnum(HistorySort)
    sort: HistorySort
    
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}

export class FetchHistoriesParamDto {
    @IsMongoId()
    id: string;
}