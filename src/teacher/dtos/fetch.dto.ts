import { IsMongoId } from "class-validator";

export class FetchTeacherParamDto {
    @IsMongoId()
    id: string;
}