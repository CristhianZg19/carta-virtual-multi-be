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

const hasImageSignature = (file: Express.Multer.File) => {
  const { buffer, mimetype } = file;

  if (mimetype === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimetype === "image/png") {
    return (
      buffer.length > 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimetype === "image/gif") {
    const signature = buffer.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }

  if (mimetype === "image/webp") {
    return (
      buffer.length > 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
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

    if (!hasImageSignature(file)) {
      throw new AppError("El archivo no parece una imagen valida", 400);
    }

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
