import { model, Schema, type Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  openingHours?: string;
  brandColors: {
    primary: string;
    accent: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    socialLinks: {
      instagram: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      tiktok: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
    },
    openingHours: { type: String, trim: true, default: "" },
    brandColors: {
      primary: { type: String, default: "#173c34" },
      accent: { type: String, default: "#d96b43" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Restaurant = model<IRestaurant>("Restaurant", restaurantSchema);
