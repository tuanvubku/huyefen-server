import { Document } from 'mongoose';

export interface ICourseTopic extends Document {
    _id: string;
    courseId: string;
    topicId: string;
}