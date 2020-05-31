import { Schema } from 'mongoose';

export const AuthorSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    permission: {
        announcement: {
            type: Boolean,
            default: false
        },
        review: {
            type: Boolean,
            default: false
        },
        privacy: {
            type: Boolean,
            default: false
        },
        messenger: {
            type: Boolean,
            default: false
        },
        invite: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
})