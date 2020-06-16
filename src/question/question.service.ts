import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as _ from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { IQuestion } from './interfaces/question.interface';
import { IAnswer } from './interfaces/answer.interface';
import { CreateDto } from '@/question/dtos/create.dto';
import { Role } from '@/config/constants';
import { IVote } from './interfaces/vote.interface';
import { IFollow } from './interfaces/follow.interface';


@Injectable()
export class QuestionService {
    constructor(
        @InjectModel('Question') private readonly questionModel: Model<IQuestion>,
        @InjectModel('Answer') private readonly answerModel: Model<IAnswer>,
        @InjectModel('Follow') private readonly followModel: Model<IFollow>
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

    async fetchOne(userId: string, userRole: Role, courseId: string, questionId: string): Promise<any> {
        const question: IQuestion = await this.questionModel
            .findOne({
                _id: questionId,
                course: courseId
            })
            .populate('user', 'name avatar');
        if (!question) return null;
        const isVoted: boolean = _.some(question.votes, vote => vote.owner.toString() === userId && vote.ownerType === userRole);
        const numOfVotes: number = _.size(question.votes);
        const follow: IFollow = await this.followModel
            .findOne({
                owner: userId,
                ownerType: userRole,
                question: questionId
            });
        const isFollowed: boolean = !!follow;
        let answers: IAnswer[] = await this.answerModel
            .aggregate([
                {
                    $match: {
                        question: Types.ObjectId(questionId)
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 5
                },
                {
                    $addFields: {
                        numOfVotes: {
                            $size: "$votes"
                        },
                        isVoted: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: '$votes',
                                            as: 'vote',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$vote.ownerType', userRole] },
                                                    { $eq: ['$$vote.owner', Types.ObjectId(userId)] }
                                                ]
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        'votes': 0,
                        'question': 0
                    }
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
            isFollowed
        };
    }

    async voteQuestion(userId: string, userRole: Role, courseId: string, questionId: string): Promise<boolean> {
        try {
            const question = await this.questionModel
                .findOneAndUpdate({
                    _id: questionId,
                    course: courseId
                }, {
                    $push: {
                        votes: {
                            owner: userId,
                            ownerType: userRole
                        } as IVote
                    }
                }, {
                    runValidators: true
                });
            return !!question;
        }
        catch {
            return false;
        }
    }

    async unvoteQuestion(userId: string, userRole: Role, courseId: string, questionId: string): Promise<boolean> {
        try {
            const question = await this.questionModel
                .findOneAndUpdate({
                    _id: questionId,
                    course: courseId
                }, {
                    $pull: {
                        votes: {
                            owner: userId,
                            ownerType: userRole
                        }
                    }
                }, {
                    runValidators: true
                });
            return !!question;
        }
        catch {
            return false;
        }
    }

    async followQuestion(userId: string, userRole: Role, questionId: string): Promise<boolean> {
        try {
            const follow: IFollow = new this.followModel({
                ownerType: userRole,
                owner: userId,
                question: questionId
            });
            await follow.save();
            return true;
        }
        catch (e) {
            return false;
        }
    }

    async unfollowQuestion(userId: string, userRole: Role, questionId: string): Promise<boolean> {
        try {
            await this.followModel
                .deleteOne({
                    ownerType: userRole,
                    owner: userId,
                    question: questionId
                });
            return true;
        }
        catch (e) {
            return false;
        }
    }

    async answer(userId: string, userRole: Role, questionId: string, content: string): Promise<any> {
        const answer: IAnswer = new this.answerModel({
            owner: userId,
            ownerType: userRole,
            question: questionId,
            content
        });
        await answer.save();
        await this.questionModel
            .findByIdAndUpdate(questionId, {
                $inc: {
                    numOfAnswers: 1
                }
            });
        return {
            ..._.pick(answer, ['_id', 'owner', 'ownerType', 'createdAt', 'content']),
            isVoted: false,
            numOfVotes: 0
        };
    }

    async voteAnswer(userId: string, userRole: Role, questionId: string, answerId: string): Promise<boolean> {
        try {
            const answer = await this.answerModel
                .findOneAndUpdate({
                    _id: answerId,
                    question: questionId
                }, {
                    $push: {
                        votes: {
                            ownerType: userRole,
                            owner: userId
                        } as IVote
                    }
                });
            return !!answer;
        }
        catch (e) {
            return false;
        }
    }

    async unvoteAnswer(userId: string, userRole: Role, questionId: string, answerId: string): Promise<boolean> {
        try {
            const answer = await this.answerModel
                .findOneAndUpdate({
                    _id: answerId,
                    question: questionId
                }, {
                    $pull: {
                        votes: {
                            ownerType: userRole,
                            owner: userId
                        }
                    }
                });
            return !!answer;
        }
        catch (e) {
            return false;
        }
    }
}
