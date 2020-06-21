import { IsMongoId, IsString, MaxLength, IsEnum, IsOptional, IsArray, IsUrl } from 'class-validator';
import { Level, Language } from '@/config/constants';

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
    @IsEnum(Language)
    language: Language;

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

export class UpdateAvatarParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateAvatarDto {
    @IsUrl()
    @IsOptional()
    url: string;
}