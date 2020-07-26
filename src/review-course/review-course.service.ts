import { Injectable, ImATeapotException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReviewCourse } from './interfaces/review.course.interface';
import { IStatus } from './interfaces/review.course.interface'
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { Role } from '@/config/constants';
import { IAnswer } from '@/question/interfaces/answer.interface';

@Injectable()
export class ReviewCourseService {
    constructor(
        @InjectModel('ReviewCourse') private readonly reviewCourseModel: Model<IReviewCourse>,
        @InjectModel('ReviewStatus') private readonly reviewStatusModel: Model<IStatus>,
        @InjectModel('ReviewAnswer') private readonly reviewAnswerModel: Model<IAnswer>
    ) { }

    async createReview(
        userId: string,
        courseId: string,
        starRating: number,
        comment: string
    ): Promise<any> {
        let review = new this.reviewCourseModel({
            course: courseId,
            user: userId,
            starRating,
            comment
        });
        review = await review.save();
        return {
            ..._.pick(review, ['_id', 'comment', 'starRating', 'createdAt']),
            likes: 0,
            dislikes: 0
        }
    }

    async fetchReviews(userId: string, courseId: string): Promise<IReviewCourse[]> {
        const reviews = await this.reviewCourseModel
            .aggregate()
            .match({
                user: mongoose.Types.ObjectId(userId),
                course: mongoose.Types.ObjectId(courseId)
            })
            .addFields({
                likes: {
                    $filter: {
                        input: '$statuses',
                        as: 'status',
                        cond: {
                            $eq: ['$$status.type', 'like']
                        }
                    }
                },
                dislikes: {
                    $filter: {
                        input: '$statuses',
                        as: 'status',
                        cond: {
                            $eq: ['$$status.type', 'dislike']
                        }
                    }
                }
            })
            .sort({
                createdAt: 'desc'
            })
            .project({
                starRating: 1,
                comment: 1,
                createdAt: 1,
                likes: {
                    $size: "$likes"
                },
                dislikes: {
                    $size: "$dislikes"
                }
            })
            .exec();
        if (!reviews)
            return null;
        return reviews;
    }

    async voteReview(ownerId: string, ownerType: Role, courseId: string, reviewId: string, voteValue: number): Promise<boolean> {
        const mapVoteValToDBVal = {
            '0': null,
            '1': 'like',
            '-1': 'dislike'
        };
        const dbVoteVal = mapVoteValToDBVal[voteValue.toString()];
        const review = await this.reviewCourseModel
            .findOne({
                _id: reviewId,
                course: courseId
            });
        if (!review) return false;
        const statusIndex = _.findIndex(review.statuses, review => review.owner.toString() === ownerId && review.ownerType === ownerType);
        if (statusIndex !== -1) {
            review.statuses[statusIndex].type = dbVoteVal; 
        }
        else {
            const newStatus = new this.reviewStatusModel({
                owner: ownerId,
                ownerType,
                type: dbVoteVal
            });
            review.statuses.push(newStatus);
        }
        await review.save();
        return true;
    }

    async fetchPublicReviews(user: any = null, courseId: string, page: number, limit: number): Promise<{ hasMore: boolean, list: any }> {
        let reviewsData: any = await this.reviewCourseModel
            .aggregate([
                {
                    $match: {
                        course: mongoose.Types.ObjectId(courseId)
                    }
                },
                {
                    $addFields: {
                        likes: {
                            $filter: {
                                input: '$statuses',
                                as: 'status',
                                cond: {
                                    $eq: ['$$status.type', 'like']
                                }
                            }
                        },
                        dislikes: {
                            $filter: {
                                input: '$statuses',
                                as: 'status',
                                cond: {
                                    $eq: ['$$status.type', 'dislike']
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        course: 0,
                        statuses: 0
                    }
                }
            ]);
        reviewsData = _.map(reviewsData, review => {
            let status = 0;
            if (user) {
                //@ts-ignore
                _.forEach(review.likes, likeItem => {
                    if (likeItem.owner.toString() === user._id && likeItem.ownerType === user.role) {
                        status = 1;
                    }
                });

                if (status === 0) {
                    //@ts-ignore
                    _.forEach(review.dislikes, dislikeItem => {
                        if (dislikeItem.owner.toString() === user._id && dislikeItem.ownerType === user.role)
                            status = -1;
                    });
                }
            }
            return {
                ..._.omit(review, ['likes', 'dislikes']),
                numOfLikes: review.likes.length,
                numOfDislikes: review.dislikes.length,
                status
            };
        });
        reviewsData.sort(function (left: IReviewCourse, right: IReviewCourse): number {
            const countScore = (item: IReviewCourse): number => {
                //@ts-ignore
                return (1.5 * item.numOfLikes + _.size(item.answers)) - item.numOfDislikes;
            };
            const leftScore: number = countScore(left);
            const rightScore: number = countScore(right);
            if (leftScore === rightScore) {
                return right.createdAt.getTime() - left.createdAt.getTime();
            }
            return countScore(right) - countScore(left);
        });
        const hasMore: boolean = page * limit < reviewsData.length;
        reviewsData = _.slice(reviewsData, (page - 1) * limit, page * limit);
        reviewsData = await this.reviewCourseModel.populate(reviewsData, [
            { path: 'user', select: 'name avatar' },
            { path: 'answers.teacher', select: 'name avatar'}
        ]);
        return {
            hasMore,
            list: reviewsData
        }
    }

    async fetchOne(courseId: string, reviewId: string): Promise<IReviewCourse> {
        const review = await this.reviewCourseModel
          .findOne({
              course: courseId,
              _id: reviewId
          })
          .populate('user', 'name avatar')
          .populate('answers.teacher', 'name avatar')
          .select('-course -statuses');
        return review;
    }

    async answer(teacherId: string, courseId: string, reviewId: string, answerContent: string): Promise<any> {
        let answer = new this.reviewAnswerModel({
            content: answerContent,
            teacher: teacherId
        });
        const review = await this.reviewCourseModel
          .findOneAndUpdate({
              _id: reviewId,
              course: courseId
          }, {
              $push: {
                  //@ts-ignore
                  answers: answer
              }
          }, {
              runValidators: true,
          });
        if (!review) return null;
        answer = await this.reviewAnswerModel.populate(answer, { path: 'teacher', select: 'name avatar'});
        return answer;
    }

    async countNumRatings(courseId: string): Promise<number> {
        return (await this.reviewCourseModel.find({ course: courseId })).length;
    }
}
