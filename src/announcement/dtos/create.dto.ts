import { IsString, IsMongoId } from "class-validator";

export class CreateDto {
    @IsString()
    content: string;

    @IsMongoId()
    courseId: string
}