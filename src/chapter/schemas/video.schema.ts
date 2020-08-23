import { Schema } from 'mongoose';

export const CaptionSchema = new Schema({
    srcLang: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    src: {
        type: String,
        required: true
    }
})

export const ResolutionSchema = new Schema({
    resolution: {
        type: Number,
        required: true
    },
    src: {
        type: String,
        required: true
    }
})

export const VideoSchema = new Schema({
    isDownloadable: {
        type: Boolean,
        default: false
    },
    captions: {
        type: [CaptionSchema],
        default: []
    },
    resolutions: {
        type: [ResolutionSchema],
        default: []
    },
    duration: {
        type: Number,
        default: 0
    }
})

