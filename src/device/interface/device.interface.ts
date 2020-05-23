import { Document } from 'mongoose';

export interface IDevice extends Document {
  customerId: string;
  token: string;
}