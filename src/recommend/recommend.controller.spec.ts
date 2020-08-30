import { Test, TestingModule } from '@nestjs/testing';
import { RecommendController } from './recommend.controller';

describe('Recommend Controller', () => {
  let controller: RecommendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendController],
    }).compile();

    controller = module.get<RecommendController>(RecommendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
