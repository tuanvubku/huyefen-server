import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
    conver: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    receivedAt: {
        type: Date,
        default: Date.now
    },
    seenAt: {
        type: Date,
        default: Date.now
    },
    content: {
        text: {
            type: String,
            default: null
        },
        image: {
            type: String,
            default: null
        },
        video: {
            type: String,
            default: null
        }
    }
});