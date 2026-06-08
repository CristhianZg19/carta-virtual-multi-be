import crypto from "crypto";
import path from "path";
import slugify from "slugify";
import { env } from "../config/env";
import { storage } from "../config/storage";
import { AppError } from "../utils/errors";

const extensionByMimeType: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const cleanPrefix = (value: string) => value.replace(/^\/+|\/+$/g, "");

const filenameFrom = (file: Express.Multer.File) => {
  const originalName = path.parse(file.originalname).name || "plato";
  const slug = slugify(originalName, { lower: true, strict: true }) || "plato";
  const extension = extensionByMimeType[file.mimetype] ?? path.extname(file.originalname);
  return `${slug}-${crypto.randomUUID()}${extension}`;
};

export const uploadService = {
  async uploadDishImage(file?: Express.Multer.File) {
    if (!file) throw new AppError("Selecciona una imagen", 400);

    if (!env.gcpStorageBucket) {
      throw new AppError("Bucket de Google Cloud no configurado", 500);
    }

    const filename = filenameFrom(file);
    const prefix = cleanPrefix(env.gcpImagesPrefix);
    const objectName = prefix ? `${prefix}/${filename}` : filename;

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
      path: filename,
      objectName,
      url: `https://storage.googleapis.com/${env.gcpStorageBucket}/${objectName}`,
      contentType: file.mimetype,
      size: file.size,
    };
  },
};
