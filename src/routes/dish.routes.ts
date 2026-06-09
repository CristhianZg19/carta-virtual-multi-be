import { Router } from "express";
import { createDish, deleteDish, getDish, listDishes, updateDish } from "../controllers/dish.controller";
import { authenticate, authenticateOptional, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { createDishSchema, listDishesSchema, updateDishSchema } from "../validators/dish.validator";

export const dishRoutes = Router();

dishRoutes.get("/", authenticateOptional, resolveRestaurantScope(), validate(listDishesSchema), listDishes);
dishRoutes.get("/:id", authenticateOptional, resolveRestaurantScope(), validate(idParamSchema), getDish);
dishRoutes.post(
  "/",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  validate(createDishSchema),
  createDish,
);
dishRoutes.put(
  "/:id",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  validate(updateDishSchema),
  updateDish,
);
dishRoutes.delete(
  "/:id",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN"),
  validate(idParamSchema),
  deleteDish,
);
