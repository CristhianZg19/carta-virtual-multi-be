import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../validators/category.validator";
import { idParamSchema } from "../validators/common.validator";

export const categoryRoutes = Router();

categoryRoutes.get("/", validate(listCategoriesSchema), listCategories);
categoryRoutes.post("/", authenticate, authorize("ADMIN", "STAFF"), validate(createCategorySchema), createCategory);
categoryRoutes.put("/:id", authenticate, authorize("ADMIN", "STAFF"), validate(updateCategorySchema), updateCategory);
categoryRoutes.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema), deleteCategory);
