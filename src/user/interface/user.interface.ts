import { Document } from 'mongoose';

export interface IUser extends Document{
  userName: string;
  password: string;
  avatar?: string,
  email: string;
  phone: string;
  gender: string;
  birthday: Date;
  job: string,
  roles?: string[],
  auth?: {
    email : {
      valid : boolean,
    },
    facebook: {
      userid: string
    },
    linkedin: {
      userid: string
    }
  }
}