import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReviewTeacher } from './interfaces/review.teacher.interface';

@Injectable()
export class ReviewTeacherService {
    constructor(
        @InjectModel('ReviewTeacher') private readonly reviewTeacherModule: Model<IReviewTeacher>
    ) { }

    async updateReviewInstructor(
        userId: string,
        teacherId: string,
        value: number,
        comment: string
    ) {
        const reviewFromDb = await this.reviewTeacherModule
            .findOneAndUpdate({  
                user: userId,
                teacher: teacherId
            }, {
                $set: {
                    rating: {
                        value,
                        comment
                    },
                    updatedAt: Date.now().toString()
                }
            })
        if (!reviewFromDb) {
            const newReview = new this.reviewTeacherModule({
                user: userId,
                teacher: teacherId,
                rating: {
                    value,
                    comment
                }
            });
            await newReview.save();
        }
        return true;
    }

    async fetchReview(userId: string, teachersId: string[]) {
        const reviews = await this.reviewTeacherModule
            .find({
                user: userId,
                teacher: {
                    $in: teachersId
                }
            })
            .select('rating teacher')
            .lean()
            .exec();
        return reviews || [];
    }
}
