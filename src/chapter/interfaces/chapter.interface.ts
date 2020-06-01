import { Document } from 'mongoose';
import { ILecture } from './lecture.interface';

export interface IChapter extends Document {
    _id: string;
    title: string;
    course: string;
    owner: string;
    updatedAt: string;
    description: string;
    lectures: ILecture[]
};