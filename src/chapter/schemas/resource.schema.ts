import {Schema} from 'mongoose';

export const ResourceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    extra: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})