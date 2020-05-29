import * as mongoose from 'mongoose';
import { FriendStatuses } from '@/config/constants';

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
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

export const UserSchema = new Schema({
	name: {
		type: String,
		minlength: 8,
		maxlength: 50,
		required: true
	},
	password: {
		type: String,
		minlength: 6,
		required: true
	},
	avatar: {
		type: String,
		default: null
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	phone: {
		type: String,
		required: true,
		minlength: 10,
		maxlength: 10,
		unique: true
	},
	gender: {
		type: String,
		required: true,
		enum: ['male', 'female']
	},
	birthday: {
		type: String,
		required: true,
		match: /\d\d\d\d-\d\d-\d\d/i
	},
	job: {
		type: Schema.Types.ObjectId,
		required: true
	},
	facebook: {
		type: String,
		default: null
	},
	linkedin: {
		type: String,
		default: null
	},
	notifications: {
		type: [NotificationSchema],
		default: []
	},
	catesOfConcern: {
		type: [Schema.Types.ObjectId],
		default: []
	},
	relationships: {
		type: [{
			friendId: Schema.Types.ObjectId,
			status: {
				type: Number,
				default: FriendStatuses.Friend
			}
		}],
		default: []
	}
});