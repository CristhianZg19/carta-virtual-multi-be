import { Router } from "express";
import { getRestaurant, updateRestaurant } from "../controllers/restaurant.controller";
import { authenticate, authenticateOptional, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateRestaurantSchema } from "../validators/restaurant.validator";

export const restaurantRoutes = Router();

restaurantRoutes.get("/", authenticateOptional, resolveRestaurantScope({ required: false }), getRestaurant);
restaurantRoutes.put(
  "/",
  authenticate,
  resolveRestaurantScope({ allowInactive: true }),
  authorize("ADMIN"),
  validate(updateRestaurantSchema),
  updateRestaurant,
);
