import { Document } from 'mongoose';
import { Notification } from '@/config/constants';

export interface INotification extends Document {
    _id: string,
    type: Notification,
	content: string,
	avatar: string,
    user: string,
    createdAt: Date,
    seen: boolean
};