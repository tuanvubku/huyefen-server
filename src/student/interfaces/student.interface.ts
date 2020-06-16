import { Document } from 'mongoose';

export interface IStudent extends Document {
    _id: string,
    course: string,
    user: string,
    createdAt: string
};