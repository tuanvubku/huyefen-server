import { Schema } from 'mongoose';
import { LectureSchema } from './lecture.schema';

export const ChapterSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: ''
    },
    lectures: {
        type: [LectureSchema],
        default: []
    }
});