import { IsString, IsMongoId } from 'class-validator';

export class AnswerDto {
    @IsString()
    content: string;
}

export class VoteAnswerDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    questionId: string;
}