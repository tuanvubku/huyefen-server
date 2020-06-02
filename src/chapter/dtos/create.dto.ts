import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class CreateDto {
    @IsMongoId()
    courseId: string;

    @IsString()
    @MaxLength(80)
    title: string;
    
    @IsString()
    @MaxLength(200)
    description: string;
}