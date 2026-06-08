import { model, Schema, type Document } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  name: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    name: { type: String, required: true, trim: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AnalyticsSnapshot = model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  analyticsSnapshotSchema,
  "analytics_snapshots",
);
