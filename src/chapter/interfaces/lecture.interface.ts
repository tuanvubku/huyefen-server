import { Document } from 'mongoose';
import { Lecture } from '@/config/constants';

export interface ILecture extends Document {
    _id: string;
    title: string;
    owner: string;
    type: Lecture,
    updatedAt: string;
    content?: string;
    isPreviewed?: boolean;
};