import { Document } from 'mongoose';

export interface ICourse extends Document {
    name: string,
    summary: string,
    avatar: string,
    authorsName: string[],
    starRating: number,
    //authors: ITeacher['_id']
}