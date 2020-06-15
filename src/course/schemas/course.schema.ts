import { Schema } from 'mongoose';
import { Level, Privacy, Price } from '@/config/constants';
import { WhatLearnSchema } from './whatLearn.schema';
import { RequirementSchema } from './requirement.schema';
import { TargetStudentSchema } from './targetStudent.schema';

export const CourseSchema = new Schema({
    title: {
        type: String,
        maxlength: 60,
        minlength: 8,
        default: null
    },
    subTitle: {
        type: String,
        maxlength: 150,
        minlength: 20,
        default: null
    },
    authors: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Teacher'
        }],
        default: []
    },
    numOfStudents: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: null
    },
    language: {
        type: Schema.Types.ObjectId,
        ref: 'Language',
        default: null
    },
    level: {
        type: String,
        default: 'allLevel',
        enum: [Level.AllLevel, Level.Beginner, Level.Intermediate, Level.Expert]
    },
    area: {
        type: Schema.Types.ObjectId,
        ref: 'Area',
        default: null
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Area.categories',
        default: null
    },
    privacy: {
        type: String,
        default: 'draft',
        enum: [Privacy.Draft, Privacy.Public, Privacy.Password, Privacy.Private]
    },
    password: {
        type: String,
        default: null,
        minlength: 6
    },
    topics: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }],
        default: []
    },
    primaryTopic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        default: null
    },
    starRating: {
        type: Number,
        default: 3.5,
        min: 1,
        max: 5
    },
    progress: {
        goals: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        syllabus: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        landing: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        messages: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    avatar: {
        type: String,
        default: null
    },
    price: {
        type: String,
        default: null,
        enum: [Price.Free, Price.TierOne, Price.TierTwo, Price.TierThree, null]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    messages: {
        welcome: {
            type: String,
            maxlength: 1000,
            default: null
        },
        congratulation: {
            type: String,
            maxlength: 1000,
            default: null
        }
    },
    whatLearns: {
        type: [WhatLearnSchema],
        default: []
    },
    requirements: {
        type: [RequirementSchema],
        default: []
    },
    targetStudents: {
        type: [TargetStudentSchema],
        default: []
    }
}, {
    timestamps: true
})