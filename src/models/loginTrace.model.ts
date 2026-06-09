import { model, Schema, Types, type Document } from "mongoose";

export type LoginTraceActorType = "BUSINESS_ADMIN" | "CREATOR_ADMIN";

export interface ILoginTrace extends Document {
  actorType: LoginTraceActorType;
  identifier: string;
  userId?: Types.ObjectId;
  userName?: string;
  restaurantId?: Types.ObjectId;
  restaurantName?: string;
  restaurantSlug?: string;
  success: boolean;
  failureReason?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loginTraceSchema = new Schema<ILoginTrace>(
  {
    actorType: { type: String, enum: ["BUSINESS_ADMIN", "CREATOR_ADMIN"], required: true, index: true },
    identifier: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId },
    userName: { type: String, trim: true, default: "" },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", index: true },
    restaurantName: { type: String, trim: true, default: "" },
    restaurantSlug: { type: String, trim: true, lowercase: true, default: "", index: true },
    success: { type: Boolean, required: true, index: true },
    failureReason: { type: String, trim: true, default: "" },
    ip: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, default: "" },
    method: { type: String, trim: true, default: "" },
    path: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

loginTraceSchema.index({ createdAt: -1 });
loginTraceSchema.index({ restaurantSlug: 1, createdAt: -1 });

export const LoginTrace = model<ILoginTrace>("LoginTrace", loginTraceSchema, "login_traces");
