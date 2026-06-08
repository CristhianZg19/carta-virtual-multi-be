import { Router } from "express";
import { createDish, deleteDish, getDish, listDishes, updateDish } from "../controllers/dish.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { createDishSchema, listDishesSchema, updateDishSchema } from "../validators/dish.validator";

export const dishRoutes = Router();

dishRoutes.get("/", validate(listDishesSchema), listDishes);
dishRoutes.get("/:id", validate(idParamSchema), getDish);
dishRoutes.post("/", authenticate, authorize("ADMIN", "STAFF"), validate(createDishSchema), createDish);
dishRoutes.put("/:id", authenticate, authorize("ADMIN", "STAFF"), validate(updateDishSchema), updateDish);
dishRoutes.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema), deleteDish);
