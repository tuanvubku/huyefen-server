import { Document } from 'mongoose';

export interface IMessage extends Document {
    _id: string;
    conver: string;
    sender: string;
    createdAt: string;
    receivedAt: string;
    seenAt: string;
    content: {
        text: string;
        image: string;
        video: string;
    }
}