import { Document } from 'mongoose';

export interface ITargetStudent extends Document {
    _id: string;
    content: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
};