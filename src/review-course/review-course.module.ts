import { Module } from '@nestjs/common';
import { ReviewCourseService } from './review-course.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
			{ name: 'ReviewCourse', schema: ReviewCourseService }
		])
    ],
    providers: [ReviewCourseService],
    exports: [ReviewCourseService]
})
export class ReviewCourseModule { }
