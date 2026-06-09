import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.stats(req.restaurant!.id);
  return sendSuccess(res, 200, "Metricas obtenidas", stats);
});
