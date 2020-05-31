import { Document } from 'mongoose';

export interface IWhatLearn extends Document {
    _id: string;
    content: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
};