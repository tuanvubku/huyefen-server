import {Document} from 'mongoose';

export interface ICourseMessenger extends Document {
    _id: string;
    content: string;
    sender: string;
    createdAt: number;
    course: string;
}