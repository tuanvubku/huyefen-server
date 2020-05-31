import { MaxLength, IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    title: string;

    @IsMongoId()
    area: string;
};