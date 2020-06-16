import { Schema } from 'mongoose';
import { Role } from '@/config/constants';

export const VoteSchema = new Schema({
    ownerType: {
        type: String,
        enum: [Role.Teacher, Role.User],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        refPath: 'votes.ownerType',
        required: true
    }
});