import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { categoryRoutes } from "./category.routes";
import { communityRoutes } from "./community.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { dishRoutes } from "./dish.routes";
import { qrRoutes } from "./qr.routes";
import { restaurantRoutes } from "./restaurant.routes";
import { tableRoutes } from "./table.routes";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({ success: true, message: "API activa", data: { status: "ok" } });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/dishes", dishRoutes);
apiRoutes.use("/categories", categoryRoutes);
apiRoutes.use("/community", communityRoutes);
apiRoutes.use("/tables", tableRoutes);
apiRoutes.use("/restaurant", restaurantRoutes);
apiRoutes.use("/qr", qrRoutes);
apiRoutes.use("/dashboard", dashboardRoutes);
