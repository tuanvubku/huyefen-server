import { Document } from 'mongoose';

export interface IResource extends Document {
    _id: String,
    name: String,
    extra: String,
    url: String
}