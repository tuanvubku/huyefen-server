import { Module } from '@nestjs/common';
import { RecommendController } from './recommend.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MostPopularSchema } from '@/recommend/schemas/mostPopular.schema';
import { HighRatingSchema } from '@/recommend/schemas/highRating.schema';
import { RecommendService } from './recommend.service';
import { CourseModule } from '@/course/course.module';
import { ReviewCourseModule } from '@/review-course/review-course.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MostPopular', schema: MostPopularSchema },
      { name: 'HighRating', schema: HighRatingSchema }
    ]),
    CourseModule,
    ReviewCourseModule
  ],
  controllers: [RecommendController],
  providers: [RecommendService]
})
export class RecommendModule {}
