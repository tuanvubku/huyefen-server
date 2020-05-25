import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Notification = new Schema({
	user:{
		type: Schema.Types.ObjectId,
		required: true
	},
	type: {
		type: Number,
		required: true
	},
	content: String,
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
		default: ''
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
		required: true
	},
	job: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Job'
	},
	facebook: String,
	linkedin: String,
	noOfUsMessage: {
		type: Number,
		default: 0
	},
	noOfUsNotification: {
		type: Number,
		default: 0
	},
	notifications: [Notification],
	catesOfConcern: [{
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: []
	}],
	friendIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	friendRequestIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	followIds: [{ type: Schema.Types.ObjectId, ref: 'Teacher', default: [] }]
});

