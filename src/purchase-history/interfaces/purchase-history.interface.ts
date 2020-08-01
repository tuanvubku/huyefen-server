import { Document } from 'mongoose';
import { PaymentWay, PurchaseItemType } from '@/config/constants';

export interface IPurchaseItem extends Document {
  _id: string;
  item: string;
  type: PurchaseItemType;
};

export interface IPurchaseHistory extends Document {
  _id: string;
  user: string;
  items: Array<IPurchaseItem>,
  createdAt: Date;
  price: number;
  paymentWay: PaymentWay;
};