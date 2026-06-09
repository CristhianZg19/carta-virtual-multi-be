import { Router } from "express";
import {
  changeCreatorPassword,
  createCompany,
  creatorLogin,
  getCreatorMe,
} from "../controllers/creator.controller";
import { authenticateCreator } from "../middlewares/creatorAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCompanySchema,
  creatorChangePasswordSchema,
  creatorLoginSchema,
} from "../validators/creator.validator";

export const creatorRoutes = Router();

creatorRoutes.post("/login", validate(creatorLoginSchema), creatorLogin);
creatorRoutes.get("/me", authenticateCreator, getCreatorMe);
creatorRoutes.put(
  "/password",
  authenticateCreator,
  validate(creatorChangePasswordSchema),
  changeCreatorPassword,
);
creatorRoutes.post(
  "/companies",
  authenticateCreator,
  validate(createCompanySchema),
  createCompany,
);
