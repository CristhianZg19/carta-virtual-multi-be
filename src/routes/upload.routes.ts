import { Router } from "express";
import multer from "multer";
import { uploadDishImage, uploadRestaurantLogo } from "../controllers/upload.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { AppError } from "../utils/errors";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Solo se permiten imagenes JPG, PNG, WebP o GIF", 400));
      return;
    }

    callback(null, true);
  },
});

export const uploadRoutes = Router();

uploadRoutes.post(
  "/dish-image",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  upload.single("image"),
  uploadDishImage,
);

uploadRoutes.post(
  "/restaurant-logo",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  upload.single("image"),
  uploadRestaurantLogo,
);
