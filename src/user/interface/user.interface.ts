import { Document } from 'mongoose';

export interface IUser extends Document {
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
  catesOfConcern?: string[]
}

