import { model, Schema, type Document } from "mongoose";

export interface ICommunitySettings extends Document {
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

export const CommunitySettings = model<ICommunitySettings>(
  "CommunitySettings",
  communitySettingsSchema,
  "community_settings",
);
