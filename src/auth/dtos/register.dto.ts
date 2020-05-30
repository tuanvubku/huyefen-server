import { IsString, IsMongoId, IsNumberString, Length, MinLength, IsEmail, IsEnum, IsISO8601 } from 'class-validator';
import { Gender } from '@/config/constants';

export class RegisterDto {
    @IsString()
    @Length(8, 50)
    readonly name: string;

    @IsString()
    @MinLength(6, {
        message: 'Password must be at least 6 chars!'
    })
    readonly password: string;

    @IsNumberString()
    @Length(10, 10)
    readonly phone: string;

    @IsEnum(Gender)
    readonly gender: string;

    @IsEmail()
    readonly email: string;

    @IsMongoId()
    readonly job: string;

    @IsISO8601()
    readonly birthday: string;
}