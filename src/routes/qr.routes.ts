import { Router } from "express";
import { generateQr } from "../controllers/qr.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import { generateQrSchema } from "../validators/qr.validator";

export const qrRoutes = Router();

qrRoutes.post(
  "/generate",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  validate(generateQrSchema),
  generateQr,
);
