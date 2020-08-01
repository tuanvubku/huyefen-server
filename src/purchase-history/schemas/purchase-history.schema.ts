import { Schema } from 'mongoose';
import { PurchaseItemType, PaymentWay } from '@/config/constants';

export const PurchaseItemSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    refPath: 'items.type',
    required: true
  },
  type: {
    type: String,
    enum: [PurchaseItemType.Course, PurchaseItemType.Bundle],
    default: PurchaseItemType.Course
  }
});

export const PurchaseHistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [PurchaseItemSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  },
  paymentWay: {
    type: String,
    enum: [PaymentWay.Credit, PaymentWay.Paypal],
    default: PaymentWay.Credit
  }
});