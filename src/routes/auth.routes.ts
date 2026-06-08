import { Router } from "express";
import { changePassword, login, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { changePasswordSchema, loginSchema } from "../validators/auth.validator";

export const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/me", authenticate, me);
authRoutes.put("/password", authenticate, validate(changePasswordSchema), changePassword);
