import { Router } from "express";
import multer from "multer";
import { uploadDishImage, uploadRestaurantLogo } from "../controllers/upload.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { securityRateLimit } from "../middlewares/security.middleware";
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

const uploadDishImageLimit = securityRateLimit({
  action: "UPLOAD_DISH_IMAGE",
  scope: "USER_RESTAURANT",
  max: 20,
  windowMs: 10 * 60 * 1000,
  autoBlockAfter: 60,
  autoBlockMs: 2 * 60 * 60 * 1000,
});

const uploadRestaurantLogoLimit = securityRateLimit({
  action: "UPLOAD_RESTAURANT_LOGO",
  scope: "USER_RESTAURANT",
  max: 10,
  windowMs: 10 * 60 * 1000,
  autoBlockAfter: 30,
  autoBlockMs: 2 * 60 * 60 * 1000,
});

uploadRoutes.post(
  "/dish-image",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  uploadDishImageLimit,
  upload.single("image"),
  uploadDishImage,
);

uploadRoutes.post(
  "/restaurant-logo",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  uploadRestaurantLogoLimit,
  upload.single("image"),
  uploadRestaurantLogo,
);
