import { Test, TestingModule } from '@nestjs/testing';
import { CourseMessengerGateway } from './course-messenger/course-messenger.gateway';

describe('CourseMessengerGateway', () => {
  let gateway: CourseMessengerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseMessengerGateway],
    }).compile();

    gateway = module.get<CourseMessengerGateway>(CourseMessengerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
