import { Schema } from 'mongoose';
import { CategorySchema } from './category.schema';

const mongoosastic = require('mongoosastic');

export const AreaSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	categories: {
		type: [CategorySchema],
		default: []
	}
});

