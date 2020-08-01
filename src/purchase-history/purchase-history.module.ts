import { Module } from '@nestjs/common';
import { PurchaseHistoryController } from './purchase-history.controller';
import { PurchaseHistoryService } from './purchase-history.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseHistorySchema, PurchaseItemSchema } from '@/purchase-history/schemas/purchase-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PurchaseHistory', schema: PurchaseHistorySchema },
      { name: 'PurchaseItem', schema: PurchaseItemSchema }
    ])
  ],
  controllers: [PurchaseHistoryController],
  providers: [PurchaseHistoryService],
  exports: [PurchaseHistoryService]
})
export class PurchaseHistoryModule {}
