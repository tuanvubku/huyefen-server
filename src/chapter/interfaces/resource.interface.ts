import { Document } from 'mongoose';
import { ResourceType } from '@/config/constants';

export interface IResource extends Document {
    _id: String,
    name: String,
    extra: String,
    url: String,
    type: ResourceType
}