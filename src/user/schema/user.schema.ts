import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, required: true, default: 'male' },
  birthday: { type: Date, required: true, default: Date.now },
  job: { type: String, required: true, default: '' },
  roles: [String],
  facebook: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  noOfUsMessage: { type: Number, default: 0 },
  noOfUsNotification: { type: Number, default: 0 },
  catesOfConcern: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', default: []
  }]
});