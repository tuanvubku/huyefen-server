import { IsString, Length } from 'class-validator';

export class CreateDto {
    @IsString()
    @Length(2, 40)
    title: string;
}