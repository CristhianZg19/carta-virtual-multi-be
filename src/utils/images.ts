import { env } from "../config/env";

export const resolveImageUrl = (image?: string | null) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;

  const base = env.gcpImagesBaseUrl.replace(/\/+$/, "");
  const path = image.replace(/^\/+/, "");
  return `${base}/${path}`;
};
