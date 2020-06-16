import { Document } from 'mongoose';


export interface IQuestion extends Document {
    _id: string;
    user: string;
    course: string;
    lecture: string;
    lectureIndex: number;
    title: string;
    numOfVotes: number;
    content: string;
    createdAt: string;
}