import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const stats = await dashboardService.stats();
  return sendSuccess(res, 200, "Metricas obtenidas", stats);
});
