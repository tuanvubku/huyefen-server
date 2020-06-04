import { IsString, Length } from 'class-validator';

export class CreateDto {
    @IsString()
    @Length(4, 40)
    title: string;
}