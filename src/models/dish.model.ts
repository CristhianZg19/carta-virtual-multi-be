import { model, Schema, Types, type Document } from "mongoose";

export interface IDish extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: Types.ObjectId;
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const dishSchema = new Schema<IDish>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

dishSchema.index({ restaurantId: 1, categoryId: 1, isAvailable: 1, order: 1 });
dishSchema.index({ restaurantId: 1, name: "text", description: "text", tags: "text" });

export const Dish = model<IDish>("Dish", dishSchema);
