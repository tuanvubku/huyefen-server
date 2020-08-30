import { Document } from 'mongoose';

export interface IMostPopular extends Document {
  _id: string;
  course: string;
  score: number;
}