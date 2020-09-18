import { Schema } from 'mongoose';

export const CourseMessengerSchema = new Schema({
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
        type: String,
        required: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
})