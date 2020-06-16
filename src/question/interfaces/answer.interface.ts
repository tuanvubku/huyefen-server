import { Document } from 'mongoose';
import { Role } from '@/config/constants';
import { IVote } from './vote.interface';

export interface IAnswer extends Document {
    _id: string;
    question: string;
    owner: string;
    ownerType: Role;
    content: string;
    createdAt: string;
    votes: [IVote]
};