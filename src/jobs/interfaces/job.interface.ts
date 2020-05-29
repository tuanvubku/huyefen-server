import { Document } from 'mongoose';

export interface IJob extends Document {
    _id: string,
    name: string
};