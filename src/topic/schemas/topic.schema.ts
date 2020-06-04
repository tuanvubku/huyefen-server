import { Schema } from 'mongoose';

export const TopicSchema = new Schema({
    title: {
        type: String,
        maxlength: 40,
        minlength: 2,
        require: true
    }
});