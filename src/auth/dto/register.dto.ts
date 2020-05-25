import { IsString, IsMongoId, IsNumberString, Length, MaxLength, MinLength, IsEmail, IsEnum, Matches, IsAlpha } from 'class-validator';

enum Gender {
    MALE = 'male',
    FEMALE = 'female'
};

export class RegisterDto {
    @IsString()
    @IsAlpha()
    @Length(15, 50)
    readonly name: string;

    @IsString()
    @MinLength(6)
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

    @Matches(/$\d\d\d\d-\d\d-\d\d^/)
    readonly birthday: string;
}