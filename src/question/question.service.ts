import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IQuestion } from './interfaces/question.interface';
import { IAnswer } from './interfaces/answer.interface';
import { CreateDto } from '@/question/dtos/create.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel('Question') private readonly questionModel: Model<IQuestion>,
        @InjectModel('Answer') private readonly answerModel: Model<IAnswer>
    ) {}

    async create(userId: string, params: CreateDto): Promise<IQuestion> {
        const {
            courseId,
            lectureId,
            lectureIndex,
            title,
            content
        } = params;
        const question: IQuestion = new this.questionModel({
            user: userId,
            course: courseId,
            lecture: lectureId,
            lectureIndex,
            title,
            content
        });
        await question.save();
        return question;
    }
}
