import { Document } from 'mongoose';

export interface ITopic extends Document {
    _id: string;
    title: string;
}