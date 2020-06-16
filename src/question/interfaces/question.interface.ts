import { Document } from 'mongoose';
import { IVote } from './vote.interface';

export interface IQuestion extends Document {
    _id: string;
    user: string;
    course: string;
    lecture: string;
    lectureIndex: number;
    title: string;
    votes: [IVote];
    numOfAnswers: number;
    content: string;
    createdAt: string;
}