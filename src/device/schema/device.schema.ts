import * as mongoose from 'mongoose';

export const DeviceSchema = new mongoose.Schema({
    customerId: { type: String },
    token: { type: String },
}, { timestamps: true });