import { IsMongoId, IsString, MaxLength, IsEnum } from 'class-validator';
import { Lecture } from '@/config/constants';

export class SyllabusDto {
    @IsMongoId()
    id: string;
}

export class CreateChapterParamDto {
    @IsMongoId()
    id: string;
}

export class CreateChapterDto {
    @IsString()
    @MaxLength(80)
    title: string;
    
    @IsString()
    @MaxLength(200)
    description: string;
}

export class UpdateChapterDto {
    @IsString()
    @MaxLength(80)
    title: string;
    
    @IsString()
    @MaxLength(200)
    description: string;
}

export class UpdateChapterParamDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    chapterId: string;
}

export class DeleteChapterParamDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    chapterId: string;
}

export class CreateLectureParamDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    chapterId: string;
}

export class CreateLectureDto {
    @IsString()
    @MaxLength(80)
    title: string;

    @IsEnum(Lecture)
    type: Lecture
}

export class UpdateLectureParamDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    chapterId: string;

    @IsMongoId()
    lectureId: string;
}

export class UpdateLectureDto {
    @IsString()
    @MaxLength(80)
    title: string;

    @IsEnum(Lecture)
    type: Lecture
}