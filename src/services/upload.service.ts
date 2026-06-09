import crypto from "crypto";
import path from "path";
import slugify from "slugify";
import { env } from "../config/env";
import { storage } from "../config/storage";
import type { RestaurantScope } from "../types/api";
import { AppError } from "../utils/errors";

const extensionByMimeType: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const cleanPrefix = (value: string) => value.replace(/^\/+|\/+$/g, "");

const filenameFrom = (file: Express.Multer.File, fallbackName: string) => {
  const originalName = path.parse(file.originalname).name || fallbackName;
  const slug = slugify(originalName, { lower: true, strict: true }) || fallbackName;
  const extension = extensionByMimeType[file.mimetype] ?? path.extname(file.originalname);
  return `${slug}-${crypto.randomUUID()}${extension}`;
};

export const uploadService = {
  async uploadImage(options: {
    file?: Express.Multer.File;
    prefix: string;
    fallbackName: string;
    restaurant: RestaurantScope;
  }) {
    const { file, prefix, fallbackName, restaurant } = options;
    if (!file) throw new AppError("Selecciona una imagen", 400);

    if (!env.gcpStorageBucket) {
      throw new AppError("Bucket de Google Cloud no configurado", 500);
    }

    const filename = filenameFrom(file, fallbackName);
    const cleanObjectPrefix = cleanPrefix(
      [env.gcpCompaniesPrefix, restaurant.storageFolder, prefix].filter(Boolean).join("/"),
    );
    const objectName = cleanObjectPrefix ? `${cleanObjectPrefix}/${filename}` : filename;

    await storage
      .bucket(env.gcpStorageBucket)
      .file(objectName)
      .save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          cacheControl: "public, max-age=31536000",
        },
      });

    return {
      path: objectName,
      objectName,
      url: `https://storage.googleapis.com/${env.gcpStorageBucket}/${objectName}`,
      contentType: file.mimetype,
      size: file.size,
    };
  },

  async uploadDishImage(restaurant: RestaurantScope, file?: Express.Multer.File) {
    return this.uploadImage({
      file,
      prefix: env.gcpImagesPrefix,
      fallbackName: "plato",
      restaurant,
    });
  },

  async uploadRestaurantLogo(restaurant: RestaurantScope, file?: Express.Multer.File) {
    return this.uploadImage({
      file,
      prefix: env.gcpLogosPrefix,
      fallbackName: "logo",
      restaurant,
    });
  },
};
