import { Document } from 'mongoose';

export interface IReviewTeacher extends Document {
    _id: string,
    course: string,
    teacher: string,
    updatedAt: string,
    rating: {
        value: number,
        comment: string
    }
};