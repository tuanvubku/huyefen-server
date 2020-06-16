import { Test, TestingModule } from '@nestjs/testing';
import { ReviewCourseService } from './review-course.service';

describe('ReviewCourseService', () => {
  let service: ReviewCourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewCourseService],
    }).compile();

    service = module.get<ReviewCourseService>(ReviewCourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
