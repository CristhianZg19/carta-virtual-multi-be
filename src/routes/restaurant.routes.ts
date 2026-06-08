import { Router } from "express";
import { getRestaurant, updateRestaurant } from "../controllers/restaurant.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateRestaurantSchema } from "../validators/restaurant.validator";

export const restaurantRoutes = Router();

restaurantRoutes.get("/", getRestaurant);
restaurantRoutes.put("/", authenticate, authorize("ADMIN"), validate(updateRestaurantSchema), updateRestaurant);
