import { IsString } from 'class-validator';

export class AnswerReviewDto {
    @IsString()
    answer: string;
}