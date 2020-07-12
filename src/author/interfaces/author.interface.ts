import { Document } from 'mongoose';

export interface IAuthor extends Document {
    _id: string;
    course: string;
    teacher: string;
    isOwner: boolean;
    permission: {
        announcements: boolean,
        reviews: boolean,
        privacy: boolean,
        messenger: boolean,
        invite: boolean
    },
    createdAt: string;
    updatedAt: string;
}