import {Document} from 'mongoose'
export interface ITeacher extends Document{
    name: string;
    phone: string;
    password:string;
    roles?: string[]
    avatar?: string;
    job?: string;
    noOfUsNotification?: number;
    biography?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    instagram?: string;
}