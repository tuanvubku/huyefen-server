import { Injectable } from '@nestjs/common';
import { CourseService } from '@/course/course.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMostPopular } from '@/recommend/interfaces/mostPopular.interface';
import { IHighRating } from '@/recommend/interfaces/highRating.interface';
import { ReviewCourseService } from '@/review-course/review-course.service';
import * as _ from 'lodash';

@Injectable()
export class RecommendService {
  constructor(
    private readonly courseService: CourseService,
    private readonly reviewCourseService: ReviewCourseService,
    @InjectModel('MostPopular') private readonly mostPopularModel: Model<IMostPopular>,
    @InjectModel('HighRating') private readonly highRatingModel: Model<IHighRating>
  ) {}

  async createNonPersonalized(): Promise<void> {
    await this.extractMostPopularCourses();
    await this.extractHighStarRatingCourses();
  }

  async countStarRatingByDampedMean(): Promise<void> {
    const k = 250;
    const countedStarRatingObj = await this.reviewCourseService.getCountedStarRatingHashMap();
    console.log('Finish count starRating Obj!');
    let totalStarRating = 0;
    let size = 0;
    _.keys(countedStarRatingObj).forEach(courseId => {
      totalStarRating += countedStarRatingObj[courseId].total;
      size += countedStarRatingObj[courseId].size;
    });
    const meanStarRating = totalStarRating / size;
    const allCourseIds = await this.courseService.getAllCourseIds();
    const bulkUpdateStarRating = [];
    allCourseIds.forEach(courseId => {
      let calStarRating = meanStarRating;
      if (countedStarRatingObj[courseId]) {
        calStarRating = (countedStarRatingObj[courseId].total + k * meanStarRating) / (countedStarRatingObj[courseId].size + k);
      }
      const bulkUpdateOp = {
        "updateOne": {
          "filter": {
            "_id": Types.ObjectId(courseId)
          },
          "update": {
            $set: {
              starRating: calStarRating
            }
          }
        }
      }
      bulkUpdateStarRating.push(bulkUpdateOp);
    });
    console.log("Finish create bulk update opts");
    await this.courseService.updateStarRatings(bulkUpdateStarRating);
  }

  async extractMostPopularCourses() {
    const minStar = 3.6;
    const minNumStudents = 1000;
    const courses = await this.courseService.createMostPopularCourses(minNumStudents, minStar);
    const data = courses.map(course => {
      return async () => {
        const t = new this.mostPopularModel({
          course: course._id
        });
        return t.save();
      }
    });
    await Promise.all(data.map(func => func()));
  }

  async extractHighStarRatingCourses() {
    const minStar = 4.0;
    const minNumStudents = 200;
    const courses = await this.courseService.createHighRatingCourses(minNumStudents, minStar);
    console.log(courses.length);
    const data = courses.map(course => {
      return async () => {
        const t = new this.highRatingModel({
          course: course._id
        });
        return t.save();
      }
    });
    await Promise.all(data.map(func => func()));
  }
}
