import { Schema } from 'mongoose';
import { Notification } from '@/config/constants';

export const NotificationSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	avatar: {
		type: String,
		default: null,
		validate: {
			validator: function(val) {
				if (!this.user)
					return val !== null;
				return true;
			},
			message: 'Notifications must have user or avatar field.'
		}
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