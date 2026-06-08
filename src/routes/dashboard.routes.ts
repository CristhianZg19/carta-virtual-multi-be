import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", authenticate, getDashboardStats);
