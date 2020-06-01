import { Document } from 'mongoose';
import { HistoryType } from '@/config/constants';

export interface IHistory extends Document {
    _id: string;
    course: string;
    user: string;
    content: string;
    type: HistoryType;
    url?: string;
    createdAt: string;
}