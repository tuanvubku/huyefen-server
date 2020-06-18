import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCourseController } from './review-course.controller';

describe('ReviewCourse Controller', () => {
  let controller: ReviewCourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewCourseController],
    }).compile();

    controller = module.get<ReviewCourseController>(ReviewCourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
