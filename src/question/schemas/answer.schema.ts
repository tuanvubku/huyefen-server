import { Schema } from 'mongoose';
import { Role } from '@/config/constants';

export const AnswerSchema = new Schema({
    question: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        refPath: 'answers.ownerType',
        required: true
    },
    ownerType: {
        type: String,
        enum: [Role.Teacher, Role.User],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    numOfVotes: {
        type: Number,
        default: 0
    }
});