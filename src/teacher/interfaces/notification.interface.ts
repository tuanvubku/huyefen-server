import { Document } from 'mongoose';
import { Notification } from '@/config/constants';

export interface INotification extends Document {
    _id: string,
    type: Notification,
    content: string,
    ownerType: string,
    owner: string,
    course?: string,
    createdAt: Date,
    seen: boolean
};