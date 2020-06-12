import { Schema } from 'mongoose';

export const ArticleSchema = new Schema({
    estimateHour: {
        type: Number,
        required: true
    },
    estimateMinute: {
        type: Number,
        required: true
    },
    content: {
        type: Object,
        default: null
    }
})