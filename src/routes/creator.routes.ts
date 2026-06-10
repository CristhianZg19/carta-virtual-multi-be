import { Router } from "express";
import {
  blockIp,
  changeCreatorPassword,
  createCompany,
  creatorLogin,
  getCreatorMe,
  listBlockedIps,
  listCompanies,
  listLoginTraces,
  listSecurityEvents,
  unblockIp,
  updateCompanyStatus,
} from "../controllers/creator.controller";
import { authenticateCreator } from "../middlewares/creatorAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  blockIpSchema,
  createCompanySchema,
  creatorChangePasswordSchema,
  creatorLoginSchema,
  listBlockedIpsSchema,
  listLoginTracesSchema,
  listSecurityEventsSchema,
  unblockIpSchema,
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
creatorRoutes.get("/login-traces", authenticateCreator, validate(listLoginTracesSchema), listLoginTraces);
creatorRoutes.get("/security/events", authenticateCreator, validate(listSecurityEventsSchema), listSecurityEvents);
creatorRoutes.get("/security/blocked-ips", authenticateCreator, validate(listBlockedIpsSchema), listBlockedIps);
creatorRoutes.post("/security/blocked-ips", authenticateCreator, validate(blockIpSchema), blockIp);
creatorRoutes.patch(
  "/security/blocked-ips/:id/unblock",
  authenticateCreator,
  validate(unblockIpSchema),
  unblockIp,
);
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
