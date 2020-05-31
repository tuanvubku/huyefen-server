import { Schema } from 'mongoose';

export const TargetStudentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }
}, {
    timestamps: true
})