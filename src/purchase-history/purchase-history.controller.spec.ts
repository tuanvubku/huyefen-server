import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseHistoryController } from './purchase-history.controller';

describe('PurchaseHistory Controller', () => {
  let controller: PurchaseHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseHistoryController],
    }).compile();

    controller = module.get<PurchaseHistoryController>(PurchaseHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
