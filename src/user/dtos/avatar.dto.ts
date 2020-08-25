import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateAvatarDto {
    @IsOptional()
    @IsString()
    avatar: string;
}