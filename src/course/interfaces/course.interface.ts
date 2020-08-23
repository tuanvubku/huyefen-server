import { Document } from 'mongoose';
import { Level, Privacy, Price, Language } from '@/config/constants';
import { IWhatLearn } from './whatLearn.interface';
import { IRequirement } from './requirement.interface';
import { ITargetStudent } from './targetStudent.interface';

export interface ICourse extends Document {
    _id: string;
    title: string;
    subTitle: string;
    authors: string[];
    numOfStudents: number;
    description: string;
    suggest: string[];
    language: Language;
    level: Level;
    area: string;
    category: string;
    privacy: Privacy;
    password: string;
    topics: string[];
    primaryTopic: string;
    avatar: string;
    starRating: number;
    progress: {
        goals: number,
        syllabus: number,
        landing: number,
        price: number,
        messages: number
    }
    price: Price;
    lastUpdated: string;
    messages: {
        welcome: string,
        congratulation: string
    },
    whatLearns: IWhatLearn[],
    requirements: IRequirement[],
    targetStudents: ITargetStudent[],
    createdAt: string;
    updatedAt: string;
}