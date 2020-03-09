import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
    avatar: String,
    email: {type: String, required: true, unique: true},
    phone: {type: String, required: true, unique: true},
    gender: {type: String, required: true},
    birthday: {type: String, required: true},
    job: {type: String, required: true},
    roles: [String],
    auth: {
        email : {
          valid : { type: Boolean, default: false }
        },
        facebook: {
          userid: String
        },
        linkedin: {
          userid: String
        }
      },
  });