import { Schema } from 'mongoose';

export const CategorySchema = new Schema({
	title: {
		type: String,
		required: true
	}
});