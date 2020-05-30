import { IsString, IsNumberString, Length, IsMongoId, IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { Gender } from '@/config/constants';

export class UpdateDto {

    @IsString()
    @Length(8, 50)
    name: string;

    @IsNumberString()
    @Length(10, 10)
    phone: string;

    @IsISO8601()
    birthday: string;

    @IsEnum(Gender)
    gender: string;

    @IsMongoId()
    job: string;

    @IsOptional()
    @IsString()
    facebook: string;

    @IsOptional()
    @IsString()
    linkedin: string;
}