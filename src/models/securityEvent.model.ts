import { model, Schema, Types, type Document } from "mongoose";

export type SecurityAction =
  | "COMMENT_CREATE"
  | "COMMENT_LIKE"
  | "DISH_LIKE"
  | "DISH_RECOMMEND"
  | "UPLOAD_DISH_IMAGE"
  | "UPLOAD_RESTAURANT_LOGO";

export type SecurityEventStatus = "ALLOWED" | "BLOCKED";
export type SecurityEventSeverity = "INFO" | "WARN" | "CRITICAL";
export type SecurityActorType = "GUEST" | "BUSINESS_ADMIN" | "CREATOR_ADMIN";

export interface ISecurityEvent extends Document {
  action: SecurityAction;
  status: SecurityEventStatus;
  severity: SecurityEventSeverity;
  reason?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  restaurantId?: Types.ObjectId;
  restaurantName?: string;
  restaurantSlug?: string;
  actorType: SecurityActorType;
  actorId?: Types.ObjectId;
  actorName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    action: {
      type: String,
      enum: [
        "COMMENT_CREATE",
        "COMMENT_LIKE",
        "DISH_LIKE",
        "DISH_RECOMMEND",
        "UPLOAD_DISH_IMAGE",
        "UPLOAD_RESTAURANT_LOGO",
      ],
      required: true,
      index: true,
    },
    status: { type: String, enum: ["ALLOWED", "BLOCKED"], required: true, index: true },
    severity: { type: String, enum: ["INFO", "WARN", "CRITICAL"], default: "INFO", index: true },
    reason: { type: String, trim: true, default: "" },
    ip: { type: String, trim: true, default: "", index: true },
    userAgent: { type: String, trim: true, default: "" },
    method: { type: String, trim: true, default: "" },
    path: { type: String, trim: true, default: "" },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", index: true },
    restaurantName: { type: String, trim: true, default: "" },
    restaurantSlug: { type: String, trim: true, lowercase: true, default: "", index: true },
    actorType: {
      type: String,
      enum: ["GUEST", "BUSINESS_ADMIN", "CREATOR_ADMIN"],
      default: "GUEST",
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, index: true },
    actorName: { type: String, trim: true, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ ip: 1, action: 1, createdAt: -1 });
securityEventSchema.index({ restaurantSlug: 1, action: 1, createdAt: -1 });
securityEventSchema.index({ actorId: 1, action: 1, createdAt: -1 });

export const SecurityEvent = model<ISecurityEvent>(
  "SecurityEvent",
  securityEventSchema,
  "security_events",
);
