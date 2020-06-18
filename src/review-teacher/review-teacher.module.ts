import { Module } from '@nestjs/common';
import { ReviewTeacherService } from './review-teacher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewTeacherSchema } from './schemas/review.teacher.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'ReviewTeacher', schema: ReviewTeacherSchema }
		])
	],
  providers: [ReviewTeacherService],
  exports: [ReviewTeacherService]
})
export class ReviewTeacherModule {}
