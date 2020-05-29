import { Document } from 'mongoose';
import { FriendStatuses } from '@/config/constants';

export interface IUser extends Document{
	_id: string;
	name: string;
	password: string;
	avatar: string,
	email: string;
	phone: string;
	gender: string;
	birthday: string;
	job: string,
	facebook: string,
	linkedin: string,
	notifications: INotification[],
	catesOfConcern: string[],
	followedTeachers: string[],
	relationships: [{
		friend: string,
		status: FriendStatuses
	}],
	conversations: string[]
};

interface INotification {
    _id: string,
    type: number,
	content: string,
	avatar: string,
    user: {
		_id: string,
		avatar: string,
		name: string
	},
    createdAt: Date,
    seen: boolean
};