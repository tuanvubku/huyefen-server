import { Role, ReviewStatus } from '@/config/constants';
import { Schema } from 'mongoose';

export const StatusSchema = new Schema({
    ownerType: {
        type: String,
        enum: [Role.Teacher, Role.User],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        refPath: 'likes.ownerType',
        required: true
    },
    type: {
        type: String,
        enum: [ReviewStatus.Like, ReviewStatus.Dislike],
        required: true
    }
});

export const AnswerSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    }
})

export const ReviewCourseSchema = new Schema({
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
    comment: {
        type: String,
        default: null
    },
    starRating: {
        type: Number,
        max: 5,
        min: 0,
        required: true
    },
    statuses: {
        type: [StatusSchema],
        default: []
    },
    answers: {
		type: [AnswerSchema],
		default: []
    }
})

