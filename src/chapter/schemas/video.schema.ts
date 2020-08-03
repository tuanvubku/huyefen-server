import { Schema } from 'mongoose';

const CaptionSchema = new Schema({
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

const ResolutionSchema = new Schema({
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
    }
})

