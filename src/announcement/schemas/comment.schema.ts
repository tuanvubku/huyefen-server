import { Schema } from 'mongoose';
import { Comment } from '@/config/constants';

export const CommentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "comments.ownerType"
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    ownerType: {
        type: String,
        required: true,
        enum: [Comment.User, Comment.Teacher]
    },
})