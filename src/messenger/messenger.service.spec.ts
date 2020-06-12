import { Test, TestingModule } from '@nestjs/testing';
import { MessengerService } from './messenger.service';

describe('MessengerService', () => {
  let service: MessengerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessengerService],
    }).compile();

    service = module.get<MessengerService>(MessengerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
