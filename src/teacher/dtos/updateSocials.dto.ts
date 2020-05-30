import { IsString, IsOptional } from 'class-validator';

export class UpdateSocialsDto {
    @IsString()
    @IsOptional()
    facebook: string;

    @IsString()
    @IsOptional()
    twitter: string;

    @IsString()
    @IsOptional()
    youtube: string;

    @IsString()
    @IsOptional()
    instagram: string;
}