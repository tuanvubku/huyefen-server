import { Document } from 'mongoose';
import {ITeacher} from '@/teacher/interface/teacher.interface'
export interface ICourse extends Document {
    name: string,
    summary: string,
    avatar: string,
    starRating: number,
    authors: ITeacher['_id']
}