import {Document} from 'mongoose';
import { Role, ReviewStatus } from '@/config/constants';

export interface IStatus extends Document {
    ownerType: Role,
    owner: string,
    type: ReviewStatus
}
interface IAnswer extends Document {
    content: string,
    createdAt: string,
    teacher: string
}
export interface IReviewCourse extends Document {
    _id: string,
    course: string,
    user: string,
    createdAt: Date,
    comment: string,
    starRating: number,
    statuses: IStatus[],
    answers: IAnswer[]
}