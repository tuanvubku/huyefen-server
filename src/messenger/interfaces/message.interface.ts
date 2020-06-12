import { Document } from 'mongoose';

export interface IMessage extends Document {
    _id: string;
    conver: string;
    sender: string;
    createdAt: number;
    receivedAt: number;
    seenAt: number;
    content: {
        text: string;
        image: string;
        video: string;
    }
}