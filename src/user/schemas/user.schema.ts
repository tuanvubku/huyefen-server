import { Schema } from 'mongoose';
import { FriendStatuses } from '@/config/constants';
import { NotificationSchema } from './notification.schema';

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
			friend: {
				type: Schema.Types.ObjectId,
				ref: 'User'
			},
			status: {
				type: Number,
				enum: [FriendStatuses.NoFriend, FriendStatuses.ReceivedInvitation, FriendStatuses.SentInvitation, FriendStatuses.Friend],
				default: FriendStatuses.Friend
			}
		}],
		default: []
	},
	followedTeachers: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Teacher'
		}],
		default: []
	},
	conversations: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'Conversation'
		}],
		default: []
	}
});