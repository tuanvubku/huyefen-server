import { Schema } from 'mongoose';
import { ResourceType } from '@/config/constants';

export const ResourceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    extra: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [ResourceType.Downloadable, ResourceType.External],
        default: ResourceType.Downloadable
    }
})