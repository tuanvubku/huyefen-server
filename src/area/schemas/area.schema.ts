import { Schema } from 'mongoose';
import { CategorySchema } from './category.schema';

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