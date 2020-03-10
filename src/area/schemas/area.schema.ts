import * as mongoose from 'mongoose';

export const AreaSchema = new mongoose.Schema({
  name: {type: String, required: true}
});