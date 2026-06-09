import { model, Schema, type Document } from "mongoose";
import { normalizeRestaurantSlug } from "../utils/restaurant";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  storageFolder: string;
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
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    storageFolder: { type: String, required: true, trim: true },
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

restaurantSchema.pre("validate", function setSlugAndFolder(next) {
  if (!this.slug && this.name) {
    this.slug = normalizeRestaurantSlug(this.name);
  } else if (this.slug) {
    this.slug = normalizeRestaurantSlug(this.slug);
  }

  if (!this.storageFolder) {
    this.storageFolder = this.slug;
  } else {
    this.storageFolder = normalizeRestaurantSlug(this.storageFolder);
  }

  next();
});

export const Restaurant = model<IRestaurant>("Restaurant", restaurantSchema);
