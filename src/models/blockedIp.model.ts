import { model, Schema, type Document } from "mongoose";

export type BlockedIpSource = "MANUAL" | "AUTO";

export interface IBlockedIp extends Document {
  ip: string;
  reason?: string;
  source: BlockedIpSource;
  isActive: boolean;
  blockedUntil?: Date | null;
  blockedBy?: string;
  unblockedBy?: string;
  unblockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blockedIpSchema = new Schema<IBlockedIp>(
  {
    ip: { type: String, required: true, trim: true, index: true },
    reason: { type: String, trim: true, default: "" },
    source: { type: String, enum: ["MANUAL", "AUTO"], default: "MANUAL", index: true },
    isActive: { type: Boolean, default: true, index: true },
    blockedUntil: { type: Date, default: null, index: true },
    blockedBy: { type: String, trim: true, default: "" },
    unblockedBy: { type: String, trim: true, default: "" },
    unblockedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

blockedIpSchema.index({ ip: 1, isActive: 1, blockedUntil: 1 });
blockedIpSchema.index({ createdAt: -1 });

export const BlockedIp = model<IBlockedIp>("BlockedIp", blockedIpSchema, "blocked_ips");
