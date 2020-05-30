import { Length, IsString, IsNumberString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateDto {
    @Length(10, 10)
    @IsNumberString()
    phone: string;

    @Length(8, 50)
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(60)
    @IsString()
    @IsOptional()
    headline: string;

    @MinLength(100)
    @IsString()
    @IsOptional()
    biography: string;
}