import { Controller, Post } from '@nestjs/common';
import { RecommendService } from '@/recommend/recommend.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('api/recommend')
export class RecommendController {
  constructor(
    private readonly recommendService: RecommendService
  ) {
  }
  @Post('/damped-mean')
  calculateDampedMean() {
    this.recommendService.countStarRatingByDampedMean().then(() => {
      console.log('Finish damped mean');
    });
    return new ResponseSuccess("OK", null);
  }
  // @Post('/create/most-popular')
  // async createNonPersonalizedRecommend() {
  //   this.recommendService.extractMostPopularCourses().then(() => {
  //     console.log('Finish damped mean')
  //   });
  //   return new ResponseSuccess("OK", null);
  // }
  // @Post('/create/high-rating')
  // async createHighRating() {
  //   this.recommendService.extractHighStarRatingCourses().then(() => {
  //     console.log('Finish damped mean')
  //   });
  //   return new ResponseSuccess("OK", null);
  // }
}
