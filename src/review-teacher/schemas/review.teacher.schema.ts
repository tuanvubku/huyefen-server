import { Schema } from 'mongoose';

export const ReviewTeacherSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    rating: {
        value: {
            type: Number,
            default: 3.5
        },
        comment: {
            type: String,
            default: null
        }
    }
})