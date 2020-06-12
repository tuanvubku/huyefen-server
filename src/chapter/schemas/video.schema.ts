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
        required: true
    },
    captions: {
        type: [CaptionSchema],
        required: true
    },
    resolutions: {
        type: [ResolutionSchema],
        required: true
    }
})

