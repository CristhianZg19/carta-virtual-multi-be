import { Router } from "express";
import {
  createTable,
  deleteTable,
  getTableQr,
  listTables,
  updateTable,
} from "../controllers/table.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { createTableSchema, updateTableSchema } from "../validators/table.validator";

export const tableRoutes = Router();

tableRoutes.use(authenticate);
tableRoutes.use(resolveRestaurantScope());
tableRoutes.get("/", listTables);
tableRoutes.post("/", authorize("ADMIN", "STAFF"), validate(createTableSchema), createTable);
tableRoutes.put("/:id", authorize("ADMIN", "STAFF"), validate(updateTableSchema), updateTable);
tableRoutes.delete("/:id", authorize("ADMIN"), validate(idParamSchema), deleteTable);
tableRoutes.get("/:id/qr", validate(idParamSchema), getTableQr);
