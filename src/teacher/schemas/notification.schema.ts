import { Schema } from 'mongoose';
import { Role } from '@/config/constants';

export const NotificationSchema = new Schema({
	owner: {
        type: Schema.Types.ObjectId,
        refPath: 'notifications.ownerType',
        required: true
    },
    ownerType: {
        type: String,
        enum: [Role.Admin, Role.Teacher, Role.User],
        required: true,
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
		type: Number,
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