import { Schema } from 'mongoose';
import { TeacherNotificationSchema } from './notification.schema';import { CourseSchema } from '@/course/schemas/course.schema';
var mongoosastic = require('mongoosastic')


export const TeacherSchema = new Schema({
    name: {
        type: String,
        minlength: 8,
        maxlength: 50,
        required: true,
        es_indexed: true
    },
    suggest: {
        type: [String],
        es_type: 'completion',
        es_search_analyzer: 'simple',
        es_analyzer: 'simple',
        es_indexed: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    avatar: {
        type: String,
        default: null,
    },
    biography: {
        type: String,
        default: null
    },
    headline: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    twitter: {
        type: String,
        default: null
    },
    youtube: {
        type: String,
        default: null
    },
    facebook: {
        type: String,
        default: null
    },
    instagram: {
        type: String,
        default: null
    },
    fcmToken: {
        type: String,
        default: null
    },
    courses: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Course',
            es_schema: CourseSchema,
            es_select: '_id',
            es_indexed: true,
        }],
        default: []
    },
    notifications: {
        type: [TeacherNotificationSchema],
        default: []
    },
    followingStudents: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    }
});

TeacherSchema.plugin(mongoosastic, {
    populate: [
        { path: 'courses' , select: '_id'}
    ]
})

