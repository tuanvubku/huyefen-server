import { Document } from 'mongoose';

export interface IArticle extends Document {
  _id: string;
  estimateHour: number;
  estimateMinute: number;
  content: any;
};