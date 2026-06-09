import { Router } from "express";
import {
  changeCreatorPassword,
  createCompany,
  creatorLogin,
  getCreatorMe,
  listCompanies,
  updateCompanyStatus,
} from "../controllers/creator.controller";
import { authenticateCreator } from "../middlewares/creatorAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCompanySchema,
  creatorChangePasswordSchema,
  creatorLoginSchema,
  updateCompanyStatusSchema,
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
creatorRoutes.get("/companies", authenticateCreator, listCompanies);
creatorRoutes.post(
  "/companies",
  authenticateCreator,
  validate(createCompanySchema),
  createCompany,
);
creatorRoutes.patch(
  "/companies/:id/status",
  authenticateCreator,
  validate(updateCompanyStatusSchema),
  updateCompanyStatus,
);
