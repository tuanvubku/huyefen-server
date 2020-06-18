import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReviewCourse } from './interfaces/review.course.interface';
import { IOwner } from './interfaces/review.course.interface'
import * as mongoose from 'mongoose'
@Injectable()
export class ReviewCourseService {
    constructor(
        @InjectModel('ReviewCourse') private readonly reviewCourseModel: Model<IReviewCourse>
    ) { }

    async createReview(
        userId: string,
        courseId: string,
        starRating: number,
        comment: string
    ): Promise<Boolean> {
        const review = new this.reviewCourseModel({
            course: courseId,
            user: userId,
            starRating,
            comment
        });
        await review.save();
        return true;
    }

    async fetchReviews(userId: string, courseId: string): Promise<IReviewCourse[]> {
        const reviews = await this.reviewCourseModel
            .aggregate()
            .match({
                user: mongoose.Types.ObjectId(userId),
                course: mongoose.Types.ObjectId(courseId)
            })
            .sort({
                createdAt: 'desc'
            })
            .project({
                starRating: 1,
                comment: 1,
                createdAt: 1,
                likes: {
                    $size: '$likes'
                },
                dislikes: {
                    $size: '$dislikes'
                }
            })
            .exec();
        if (!reviews)
            return null;
        return reviews;
    }

    async updateLike(userLikeId: string, reviewId: string) {
        console.log(reviewId)
        const like = {
            owner: userLikeId,
            ownerType: 'User'
        } as IOwner;
        const review = await this.reviewCourseModel
            .findByIdAndUpdate(reviewId, {
                $push: {
                    likes: like,
                    dislikes: like
                }
            }, {
                new: true
            })
        if (!review)
            return false;
        return true;
    }
}
