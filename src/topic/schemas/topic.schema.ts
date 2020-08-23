import { Schema } from 'mongoose';
var mongoosastic = require('mongoosastic')

export const TopicSchema = new Schema({
    title: {
        type: String,
        maxlength: 40,
        minlength: 2,
        require: true,
        es_indexed: true
    },
    suggest: {
        type: [String],
        es_type: 'completion',
        es_search_analyzer: 'simple',
        es_analyzer: 'simple',
        es_indexed: true
    },
});

TopicSchema.plugin(mongoosastic)