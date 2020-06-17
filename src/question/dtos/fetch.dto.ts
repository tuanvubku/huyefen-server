import { IsEnum, IsMongoId, IsArray, IsString, IsNumberString } from 'class-validator';
import { QuestionSort, QuestionType } from '@/config/constants';

export class FetchDto {
    @IsEnum(QuestionSort)
    sort: QuestionSort;

    @IsString()
    lecture: string;

    @IsString()
    questionTypes: string;

    @IsMongoId()
    courseId: string;

    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}