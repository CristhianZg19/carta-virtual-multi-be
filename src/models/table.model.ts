import { model, Schema, Types, type Document } from "mongoose";

export interface ITable extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  code: string;
  qrUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    qrUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

tableSchema.index({ restaurantId: 1, code: 1 }, { unique: true });
tableSchema.index({ restaurantId: 1, name: 1 });

export const DiningTable = model<ITable>("Table", tableSchema);
