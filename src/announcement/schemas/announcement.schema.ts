import { Schema } from 'mongoose';
import { CommentSchema } from './comment.schema';

export const AnnouncementSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    comments: {
        type: [CommentSchema],
        default: []
    }
})
