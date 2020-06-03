import { Schema } from 'mongoose';
import { Lecture } from '@/config/constants';

export const LectureSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    type: {
        type: String,
        enum: [Lecture.Video, Lecture.Article],
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: Schema.Types.ObjectId,
        refPath: 'type',
        default: null
    },
    isPreviewed: {
        type: Boolean,
        default: false
    }
})