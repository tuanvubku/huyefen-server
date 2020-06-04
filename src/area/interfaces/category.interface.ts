import { Document } from 'mongoose';

export interface ICategory extends Document {
    _id: string;
    title: string;
};