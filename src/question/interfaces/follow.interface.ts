import { Document } from 'mongoose';
import { Role } from '@/config/constants';

export interface IFollow extends Document {
    ownerType: Role;
    owner: string;
    question: string;
}