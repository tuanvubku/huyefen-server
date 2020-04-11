import { Document } from 'mongoose';

export interface IUser extends Document {
  id?: string;
  userName: string;
  password: string;
  avatar?: string,
  email: string;
  phone: string;
  gender: string;
  birthday: Date;
  job: string,
  roles?: string[],
  facebook?: string,
  linkedin?: string,
  noOfUsMessage?: number,
  noOfUsNotification?: number,
  notifications?: Notification[],
  catesOfConcern?: string[],
  friendIds?: string[],
  friendRequestIds?: string[],
  followIds?: string[],
}

interface Notification {
  id: string,
  type: number,
  content: string,
  user: string,
  createdAt: Date,
  seen: boolean
}

