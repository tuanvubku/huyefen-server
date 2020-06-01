import { IsNumberString, IsEnum } from 'class-validator';
import { TeacherCoursesSort as Sort } from '@/config/constants';

export class FetchDto {
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;

    @IsEnum(Sort)
    sort: Sort;
};