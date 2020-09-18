import { Test, TestingModule } from '@nestjs/testing';
import { CourseMessengerController } from './course-messenger.controller';

describe('CourseMessenger Controller', () => {
  let controller: CourseMessengerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseMessengerController],
    }).compile();

    controller = module.get<CourseMessengerController>(CourseMessengerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
