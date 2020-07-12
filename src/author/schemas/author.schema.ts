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
    isOwner: {
        type: Boolean,
        default: false
    },
    permission: {
        announcements: {
            type: Boolean,
            default: false
        },
        reviews: {
            type: Boolean,
            default: false
        },
        privacy: {
            type: Boolean,
            default: false
        },
        messenger: {
            type: Boolean,
            default: true
        },
        invite: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
})