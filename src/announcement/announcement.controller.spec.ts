import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementController } from './announcement.controller';

describe('Announcement Controller', () => {
  let controller: AnnouncementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
    }).compile();

    controller = module.get<AnnouncementController>(AnnouncementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
