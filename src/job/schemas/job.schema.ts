import { Schema } from 'mongoose';

export const JobSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});