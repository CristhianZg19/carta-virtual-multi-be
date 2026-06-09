import { model, Schema, Types, type Document } from "mongoose";

export type CommentStatus = "VISIBLE" | "HIDDEN";

export interface IComment extends Document {
  restaurantId: Types.ObjectId;
  dishId: Types.ObjectId;
  guestId: string;
  guestName: string;
  content: string;
  likeCount: number;
  status: CommentStatus;
  isFeatured: boolean;
  isPinned: boolean;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true, index: true },
    guestId: { type: String, required: true, trim: true, index: true },
    guestName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    likeCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["VISIBLE", "HIDDEN"], default: "VISIBLE", index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPinned: { type: Boolean, default: false, index: true },
    moderationReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

commentSchema.index({ restaurantId: 1, content: "text", guestName: "text" });
commentSchema.index({ restaurantId: 1, dishId: 1, status: 1, isPinned: -1, createdAt: -1 });

export const Comment = model<IComment>("Comment", commentSchema, "comments");
