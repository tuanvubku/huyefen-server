import { Test, TestingModule } from '@nestjs/testing';
import { MessengerController } from './messenger.controller';

describe('Messenger Controller', () => {
  let controller: MessengerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessengerController],
    }).compile();

    controller = module.get<MessengerController>(MessengerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
