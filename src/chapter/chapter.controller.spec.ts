import { Test, TestingModule } from '@nestjs/testing';
import { ChapterController } from './chapter.controller';

describe('Chapter Controller', () => {
  let controller: ChapterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChapterController],
    }).compile();

    controller = module.get<ChapterController>(ChapterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
