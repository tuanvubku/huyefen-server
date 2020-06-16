import { IsString, MaxLength, IsMongoId, IsNumber } from 'class-validator';

export class CreateDto {
    @IsString()
    @MaxLength(60)
    title: string;

    @IsString()
    content: string;

    @IsMongoId()
    courseId: string;

    @IsMongoId()
    lectureId: string;

    @IsNumber()
    lectureIndex: number;
}