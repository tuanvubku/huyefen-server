import { IsMongoId, IsString, MaxLength } from 'class-validator';

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