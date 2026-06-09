import { model, Schema, Types, type Document } from "mongoose";

export type LikeTargetType = "DISH" | "COMMENT";
export type LikeKind = "LIKE" | "RECOMMENDATION";

export interface ILike extends Document {
  restaurantId: Types.ObjectId;
  targetType: LikeTargetType;
  targetId: Types.ObjectId;
  dishId?: Types.ObjectId;
  guestId: string;
  kind: LikeKind;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    targetType: { type: String, enum: ["DISH", "COMMENT"], required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", index: true },
    guestId: { type: String, required: true, trim: true, index: true },
    kind: { type: String, enum: ["LIKE", "RECOMMENDATION"], required: true, index: true },
  },
  { timestamps: true },
);

likeSchema.index(
  { restaurantId: 1, guestId: 1, targetType: 1, targetId: 1, kind: 1 },
  { unique: true },
);
likeSchema.index({ restaurantId: 1, targetType: 1, targetId: 1, kind: 1 });

export const Like = model<ILike>("Like", likeSchema, "likes");
