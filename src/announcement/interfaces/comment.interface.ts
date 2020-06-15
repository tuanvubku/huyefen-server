import { Document } from 'mongoose';
import { Comment } from '@/config/constants'

export interface IComment extends Document {
    _id: string,
    ownerType: Comment,
    owner: string,
    content: string,
    createdAt: string
}