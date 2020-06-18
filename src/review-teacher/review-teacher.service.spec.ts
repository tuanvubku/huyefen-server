import { Test, TestingModule } from '@nestjs/testing';
import { ReviewTeacherService } from './review-teacher.service';

describe('ReviewTeacherService', () => {
  let service: ReviewTeacherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewTeacherService],
    }).compile();

    service = module.get<ReviewTeacherService>(ReviewTeacherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
