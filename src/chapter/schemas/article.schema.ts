import { Schema } from 'mongoose';

export const ArticleSchema = new Schema({
    estimateHour: {
        type: Number,
        default: 0
    },
    estimateMinute: {
        type: Number,
        default: 0
    },
    content: {
        type: String,
        default: ''
    }
});