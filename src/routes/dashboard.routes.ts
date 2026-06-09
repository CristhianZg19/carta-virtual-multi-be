import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { resolveRestaurantScope } from "../middlewares/restaurantScope.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", authenticate, resolveRestaurantScope(), getDashboardStats);
