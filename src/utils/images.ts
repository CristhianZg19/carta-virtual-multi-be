import { env } from "../config/env";

const resolveUrl = (baseUrl: string, image?: string | null) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;

  const base = baseUrl.replace(/\/+$/, "");
  const path = image.replace(/^\/+/, "");
  return `${base}/${path}`;
};

export const resolveDishImageUrl = (image?: string | null) =>
  resolveUrl(env.gcpImagesBaseUrl, image);

export const resolveRestaurantLogoUrl = (image?: string | null) =>
  resolveUrl(env.gcpLogosBaseUrl, image);

export const resolveImageUrl = resolveDishImageUrl;
