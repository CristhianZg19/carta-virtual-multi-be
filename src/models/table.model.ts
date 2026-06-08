import { model, Schema, type Document } from "mongoose";

export interface ITable extends Document {
  name: string;
  code: string;
  qrUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    qrUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const DiningTable = model<ITable>("Table", tableSchema);
