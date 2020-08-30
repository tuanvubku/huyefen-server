import { Module } from '@nestjs/common';
import { RecommendController } from './recommend.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MostPopularSchema } from '@/recommend/schemas/mostPopular.schema';
import { HighRatingSchema } from '@/recommend/schemas/highRating.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MostPopular', schema: MostPopularSchema },
      { name: 'HighRating', schema: HighRatingSchema }
    ])
  ],
  controllers: [RecommendController]
})
export class RecommendModule {}
