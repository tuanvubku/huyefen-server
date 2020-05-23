import * as mongoose from 'mongoose'

export const CourseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    summary: {type: String, required: true},
    avatar: {type: String, required: true},
    starRating: {type: Number, required: true, default: 0},
    author: {type: String, required: true}
})