import { Document } from 'mongoose';

export interface IHighRating extends Document {
  _id: string;
  course: string;
  score: number;
}