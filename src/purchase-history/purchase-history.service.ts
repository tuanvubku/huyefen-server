import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPurchaseHistory, IPurchaseItem } from '@/purchase-history/interfaces/purchase-history.interface';
import { map, capitalize, pick, slice } from 'lodash';
import { mapKeyToPrice } from '@/utils/utils';

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

  async fetchPurchaseHistory(userId: string, skip: number, limit: number): Promise<any> {
    const rawData = await this.purchaseHistoryModel
      .find({ user: userId })
      .populate('items.item', '_id title avatar price')
      .sort('-createdAt')
      .lean()
      .exec()
    const data = map(rawData, purchaseHistory => {
      return {
        _id: purchaseHistory._id,
        paymentType: purchaseHistory.paymentWay,
        date: purchaseHistory.createdAt,
        totalPrice: purchaseHistory.price,
        items: map(purchaseHistory.items, item => ({
          //@ts-ignore
          ...pick(item.item, ['_id', 'title', 'avatar']),
          type: item.type,
          price: mapKeyToPrice(item.item.price)
        }))
      };
    })
    return {
      total: data.length,
      list: slice(data, skip, skip + limit)
    }
  }

}
