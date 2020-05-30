import { IsString, Length, MinLength } from 'class-validator';

export class LoginTeacherDto {
    @IsString()
    @Length(10, 10)
    phone: string;

    @IsString()
    @MinLength(6)
    password: string;
}