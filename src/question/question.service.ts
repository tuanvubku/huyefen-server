import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import * as _ from 'lodash';
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

    async fetchOne(userId: string, userRole, courseId: string, questionId: string): Promise<any> {
        const question: IQuestion = await this.questionModel
            .findOne({
                _id: questionId,
                course: courseId
            })
            .populate('user', 'name avatar');
        if (!question) return null;
        const isVoted: boolean = _.some(question.votes, vote => vote.owner.toString() === userId && vote.ownerType === userRole);
        const numOfVotes: number = _.size(question.votes);
        //get isFollowed
        //moreAnswers, numOfAnswers, and answers (5)
        let answers: IAnswer[] = await this.answerModel
            .aggregate([
                {
                    $match: {
                        question: questionId
                    }
                },
                {
                    $addField: {
                        numOfVotes: {
                            $sum: "$votes"
                        },
                        isVoted: {
                            $in: [
                                { owner: userId, ownerType: userRole },
                                "$votes"
                            ]
                        }
                    }
                },
                {
                    $projection: {
                        'votes': 0,
                        'question': 0
                    }
                },
                {
                    $skip: 0,
                    $limit: 5
                }
            ]);
        answers = await this.answerModel.populate(answers, { path: 'owner', select: 'name avatar' });
        const moreAnswers: boolean = question.numOfAnswers > 5;
        return {
            ..._.pick(question, ['_id', 'title', 'content', 'user', 'lectureId', 'lectureIndex', 'createdAt', 'numOfAnswers']),
            isVoted,
            numOfVotes,
            moreAnswers,
            answers,
            isFollowed: false
        };
    }
}
