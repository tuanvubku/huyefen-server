import { Document } from 'mongoose';

export interface IFriend {
    _id: string;
    name: string;
    avatar: string;
    numOfFriends: number;
}