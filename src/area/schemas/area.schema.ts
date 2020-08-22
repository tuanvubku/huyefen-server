import { Schema } from 'mongoose';
import { CategorySchema } from './category.schema';
var mongoosastic = require('mongoosastic')
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

