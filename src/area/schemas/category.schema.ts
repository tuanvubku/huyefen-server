import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema({
  name: {type: String, required: true},
  areaId: {type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true}
});