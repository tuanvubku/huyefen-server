import { Document } from 'mongoose';
import { Lecture } from '@/config/constants';
import { IResource } from '@/chapter/interfaces/resource.interface';

export interface ILecture extends Document {
    _id: string;
    title: string;
    owner: string;
    type: Lecture,
    updatedAt: string;
    content?: string;
    isPreviewed?: boolean;
    description: string;
    resources: Array<IResource>;
    completed: Array<string>;
};