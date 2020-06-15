import { Document } from 'mongoose';
import { IComment } from './comment.interface';

export interface IAnnouncement extends Document {
    _id: string,
    course: string,
    teacher: string,
    createdAt: string,
    comments: IComment[],
}