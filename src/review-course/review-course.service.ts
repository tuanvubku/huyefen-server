import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReviewCourse } from './interfaces/review.course.interface';

@Injectable()
export class ReviewCourseService {
    constructor(
        @InjectModel('ReviewCourse') private readonly reviewCourseModule: Model<IReviewCourse>
    ) { }

    async createReview(
        userId: string,
        courseId: string,
        starRating: number,
        comment: string
    ) {
        const review = new this.reviewCourseModule({
            course: courseId,
            user: userId,
            starRating,
            comment
        });
        await review.save();
        console.log(review);
        return true;
    }

    async fetchReview(userId: string, courseId: string) {

    }
}
