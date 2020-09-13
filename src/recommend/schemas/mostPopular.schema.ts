import { Schema } from 'mongoose';

export const MostPopularSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
})