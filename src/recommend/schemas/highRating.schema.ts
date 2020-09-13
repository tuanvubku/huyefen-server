import { Schema } from 'mongoose';

export const HighRatingSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
});