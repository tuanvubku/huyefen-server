import { Schema } from 'mongoose';
import { HistoryType } from '@/config/constants';

export const HistorySchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    type: {
        type: Number,
        required: true,
        enum: [
            HistoryType.Goals,
            HistoryType.Syllabus,
            HistoryType.Landing,
            HistoryType.Price,
            HistoryType.Messages,
            HistoryType.Lecture
        ]
    },
    url: {
        type: String,
        required: function() { return this.type === HistoryType.Lecture }
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});