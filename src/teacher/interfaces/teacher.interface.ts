import { Document } from 'mongoose';
import { INotification } from '@/user/interfaces/notification.interface';


export interface ITeacher extends Document {
    _id: string;
    name: string;
    password: string;
    avatar: string;
    biography: string;
    headline: string;
    phone: string;
    email: string;
    twitter: string;
    facebook: string;
    youtube: string;
    instagram: string;
    followingStudents: string[];
    notifications: INotification[]
};