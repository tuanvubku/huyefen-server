import { Schema } from 'mongoose';
import { Role } from '@/config/constants';

export const FollowSchema = new Schema({
    ownerType: {
        type: String,
        enum: [Role.User, Role.Teacher],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'ownerType'
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }
});