import { Role } from '@/config/constants';
import { Schema } from 'mongoose';

const LikeOwnerSchema = new Schema({
    ownerType: {
        type: String,
        enum: [Role.Teacher, Role.User],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        refPath: 'likes.ownerType',
        required: true
    }
})

const DisLikeOwnerSchema = new Schema({
    ownerType: {
        type: String,
        enum: [Role.Teacher, Role.User],
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        refPath: 'dislikes.ownerType',
        required: true
    }
})

const AnswerSchema = new Schema({
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
    likes: {
        type: [LikeOwnerSchema],
        default: []
    },
    dislikes: {
        type: [DisLikeOwnerSchema],
        default: []
    },
    answers: {
		type: [AnswerSchema],
		default: []
    }
})

