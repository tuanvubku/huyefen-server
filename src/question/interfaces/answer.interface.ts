import { Document } from 'mongoose';
import { Role } from '@/config/constants';

export interface IAnswer extends Document {
    _id: string;
    question: string;
    owner: string;
    ownerType: Role;
    content: string;
    createdAt: string;
    numOfVotes: number;
};