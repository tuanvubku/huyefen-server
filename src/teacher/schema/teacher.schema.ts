import * as mongoose from 'mongoose';

export const TeacherSchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    avatar: {type: String, default: ""},
    roles: [String],
    job: String,
    noOfUsNotification: {type: Number, default: 0},
    numOfCourses: {type: Number, default: 0},
    numOfStudents: {type: Number, default: 0},
    numOfReviews: {type: Number, default: 0},
    biography: {type: String, default: ""},
    twitter: {type: String, default: ""},
    facebook: {type: String, default: "" },
    youtube: {type: String, default: "" },
    instagram: {type: String, default: "" }
})