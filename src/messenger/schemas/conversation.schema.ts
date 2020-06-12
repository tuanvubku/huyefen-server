import { Schema } from 'mongoose';

export const ConversationSchema = new Schema({
    members: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    name: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
        required: true
    },
    lastMessage: {
        type: String,
        required: true,
        default: null
    }
});