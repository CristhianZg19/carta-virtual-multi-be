import { model, Schema, Types, type Document } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

analyticsSnapshotSchema.index({ restaurantId: 1, name: 1, createdAt: -1 });

export const AnalyticsSnapshot = model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  analyticsSnapshotSchema,
  "analytics_snapshots",
);
