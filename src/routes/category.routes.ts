import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller";
import { authenticate, authenticateOptional, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../validators/category.validator";
import { idParamSchema } from "../validators/common.validator";

export const categoryRoutes = Router();

categoryRoutes.get(
  "/",
  authenticateOptional,
  resolveRestaurantScope(),
  validate(listCategoriesSchema),
  listCategories,
);
categoryRoutes.post(
  "/",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  validate(createCategorySchema),
  createCategory,
);
categoryRoutes.put(
  "/:id",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN", "STAFF"),
  validate(updateCategorySchema),
  updateCategory,
);
categoryRoutes.delete(
  "/:id",
  authenticate,
  resolveRestaurantScope(),
  authorize("ADMIN"),
  validate(idParamSchema),
  deleteCategory,
);
