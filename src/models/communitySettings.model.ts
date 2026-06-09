import { model, Schema, Types, type Document } from "mongoose";

export interface ICommunitySettings extends Document {
  restaurantId: Types.ObjectId;
  commentsEnabled: boolean;
  recommendationsEnabled: boolean;
  likesEnabled: boolean;
  showMostRecommended: boolean;
  showFeaturedComments: boolean;
  autoModerationEnabled: boolean;
  allowGuestDeleteComments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communitySettingsSchema = new Schema<ICommunitySettings>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    commentsEnabled: { type: Boolean, default: false },
    recommendationsEnabled: { type: Boolean, default: false },
    likesEnabled: { type: Boolean, default: false },
    showMostRecommended: { type: Boolean, default: false },
    showFeaturedComments: { type: Boolean, default: false },
    autoModerationEnabled: { type: Boolean, default: true },
    allowGuestDeleteComments: { type: Boolean, default: true },
  },
  { timestamps: true },
);

communitySettingsSchema.index({ restaurantId: 1 }, { unique: true });

export const CommunitySettings = model<ICommunitySettings>(
  "CommunitySettings",
  communitySettingsSchema,
  "community_settings",
);
