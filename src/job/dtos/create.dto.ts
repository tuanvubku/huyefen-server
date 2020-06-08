import { IsString, MinLength } from 'class-validator';

export class CreateDto {
    @IsString()
    @MinLength(4)
    title: string;
}