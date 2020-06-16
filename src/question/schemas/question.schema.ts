import { Schema } from 'mongoose';
import { AnswerSchema } from './answer.schema';

export const QuestionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lecture: {
        type: Schema.Types.ObjectId,
        required: true
    },
    lectureIndex: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    numOfVotes: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
