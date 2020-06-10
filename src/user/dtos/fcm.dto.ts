import { IsString, IsOptional } from 'class-validator';

export class UpdateFCMDto {
    @IsString()
    @IsOptional()
    token: string;
}