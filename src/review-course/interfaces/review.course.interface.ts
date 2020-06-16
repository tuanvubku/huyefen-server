import {Document} from 'mongoose';
import { Role } from '@/config/constants';

interface IOwner extends Document {
    ownerType: Role,
    owner: string
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
    createdAt: string,
    comment: string,
    starRating: number,
    likes: IOwner[],
    dislikes: IOwner[],
    answers: IAnswer[]
}