import { Schema } from 'mongoose';
import { Notification, Role } from '@/config/constants';

export const NotificationSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		refPath: 'notifications.ownerType',
		required: true
	},
	ownerType: {
		type: String,
		enum: [Role.Admin, Role.Teacher, Role.User],
		required: true
	},
	course: {
		type: Schema.Types.ObjectId,
		default: null
	},
	type: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
		default: ''
	},
	seen: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});