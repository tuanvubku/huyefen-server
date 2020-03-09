import * as mongoose from 'mongoose';

export const AreaSchema = new mongoose.Schema({
  name: String,
  category: [String],
});