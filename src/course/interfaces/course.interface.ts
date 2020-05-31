import { Document } from 'mongoose';
import { Level, Privacy, Price } from '@/config/constants';
import { IWhatLearn } from './whatLearn.interface';
import { IRequirement } from './requirement.interface';
import { ITargetStudent } from './targetStudent.interface';

export interface ICourse extends Document {
    _id: string;
    title: string;
    subTitle: string;
    description: string;
    language: string;
    level: Level;
    area: string;
    category: string;
    privacy: Privacy;
    password: string;
    avatar: string;
    price: Price;
    lastUpdated: string;
    messages: {
        welcome: string,
        congratulation: string
    },
    whatLeans: IWhatLearn[],
    requirements: IRequirement[],
    targetStudents: ITargetStudent[],
    createdAt: string;
    updatedAt: string;
}