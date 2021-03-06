import { Document } from 'mongoose';

export interface IConversation extends Document {
    _id: string;
    members: string[];
    name: string[];
    lastUpdated: string;
    lastMessage: string;
}