import { Document } from 'mongoose';
import { INotification } from './notification.interface';


export interface ITeacher extends Document {
    _id: string;
    name: string;
    password: string;
    suggest: [string];
    avatar: string;
    biography: string;
    headline: string;
    phone: string;
    email: string;
    twitter: string;
    facebook: string;
    youtube: string;
    instagram: string;
    fcmToken: string;
    courses: string[];
    followingStudents: string[];
    notifications: INotification[]
};