import { Document } from 'mongoose';

export interface IUser extends Document {
	_id: string;
	name: string;
	password: string;
	avatar: string,
	email: string;
	phone: string;
	gender: string;
	birthday: Date;
	job: string,
	facebook: string,
	linkedin: string,
	notifications?: Notification[],
	catesOfConcern: string[],
	friendRequestIds?: string[],
  followIds?: string[],
  friendIds?: string[],
  
};

interface Notification {
    _id: string,
    type: number,
    content: string,
    user: {
		_id: string,
		avatar: string,
		name: string
	},
    createdAt: Date,
    seen: boolean
};