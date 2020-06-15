import { Schema } from 'mongoose';

export const StudentSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number,
        default: 0
    },
    rating: {
        value: {
            type: Number,
            max: 5,
            min: 1,
            default: 3.5
        },
        comment: {
            type: String,
            default: null
        }
    }
});