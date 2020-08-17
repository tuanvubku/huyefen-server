import { Schema } from 'mongoose';
import { Lecture } from '@/config/constants';
import { ResourceSchema } from './resource.schema';

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
        refPath: 'lectures.type',
        default: null
    },
    isPreviewed: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: null
    },
    resources: {
        type: [ResourceSchema],
        default: []
    }
})