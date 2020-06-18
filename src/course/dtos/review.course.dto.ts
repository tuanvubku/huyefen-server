import { IsDefined, IsNumber, IsOptional } from "class-validator";


export class ReviewCourseDto {
    @IsDefined()
    @IsNumber()
    starRating: number

    @IsOptional()
    comment: string
}