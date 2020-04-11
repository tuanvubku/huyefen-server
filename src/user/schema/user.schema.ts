import * as mongoose from 'mongoose';

const Notification = new mongoose.Schema({
  user:{type: mongoose.Schema.Types.ObjectId, required: true },
  type: {type: Number, required: true},
  content: {type: String},
  createdAt: {type: Date, default: Date.now},
  seen: {type: Boolean, default: false}
})

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
  notifications: { type: [Notification] },
  catesOfConcern: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', default: []
  }],
  friendIds: [{type: String}],
  friendRequestIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  followIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher',default: []}]
});

