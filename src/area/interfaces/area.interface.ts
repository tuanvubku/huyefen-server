import { Document } from 'mongoose';
import { ICategory } from './category.interface';

export interface IArea extends Document {
    _id: string;
    title: string;
    categories: ICategory[]
};