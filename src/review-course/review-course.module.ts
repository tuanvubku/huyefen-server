import { Module } from '@nestjs/common';
import { ReviewCourseService } from './review-course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewCourseSchema, AnswerSchema, StatusSchema } from './schemas/review.course.schema';
import { ReviewCourseController } from './review-course.controller';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'ReviewCourse', schema: ReviewCourseSchema },
            { name: 'ReviewAnswer', schema: AnswerSchema },
            { name: 'ReviewStatus', schema: StatusSchema }
        ])
    ],
    providers: [ReviewCourseService],
    exports: [ReviewCourseService],
    controllers: [ReviewCourseController]
})
export class ReviewCourseModule { }
