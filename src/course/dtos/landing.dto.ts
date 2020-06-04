import { IsMongoId, IsString, MaxLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Level } from '@/config/constants';

export class FetchLandingDto {
    @IsMongoId()
    id: string;
}

export class UpdateLandingParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateLandingDto {

    @IsOptional()
    @IsString()
    @MaxLength(60)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    subTitle: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsMongoId()
    language: string;

    @IsOptional()
    @IsEnum(Level)
    level: string;

    @IsOptional()
    @IsMongoId()
    area: string;

    @IsOptional()
    @IsMongoId()
    category: string;

    @IsArray()
    topics: string[];

    @IsOptional()
    @IsMongoId()
    primaryTopic: string;
}