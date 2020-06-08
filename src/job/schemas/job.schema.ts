import { Schema } from 'mongoose';

export const JobSchema = new Schema({
    title: {
        type: String,
        required: true
    }
});