import * as mongoose from 'mongoose';

export const TeacherSchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    avatar: {type: String},
    job: String,
    noOfUsNotification: String,
    twitter: String,
    facebook: String,
    youtube: String,
    instagram: String
})