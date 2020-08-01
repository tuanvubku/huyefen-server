import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseHistoryService } from './purchase-history.service';

describe('PurchaseHistoryService', () => {
  let service: PurchaseHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseHistoryService],
    }).compile();

    service = module.get<PurchaseHistoryService>(PurchaseHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
