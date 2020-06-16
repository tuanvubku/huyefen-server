import { Document } from 'mongoose';
import { Role } from '@/config/constants';

export interface IVote extends Document {
    _id: string;
    ownerType: Role;
    owner: string;
}