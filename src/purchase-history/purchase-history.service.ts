import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPurchaseHistory, IPurchaseItem } from '@/purchase-history/interfaces/purchase-history.interface';
import { map, capitalize } from 'lodash';

@Injectable()
export class PurchaseHistoryService {
  constructor(
    @InjectModel('PurchaseHistory') private readonly purchaseHistoryModel: Model<IPurchaseHistory>,
    @InjectModel('PurchaseItem') private readonly purchaseItemModel: Model<IPurchaseItem>
  ) {}

  async createOne(userId: string, items: Array<any>, price: number): Promise<void> {
    const purchaseItems = map(items, item => (new this.purchaseItemModel({
      item: item._id,
      type: capitalize(item.type)
    })));
    const purchaseHistory = new this.purchaseHistoryModel({
      user: userId,
      items: purchaseItems,
      price: price
    });
    await purchaseHistory.save();
  }
}
