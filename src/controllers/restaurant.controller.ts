import { restaurantService } from "../services/restaurant.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getRestaurant = asyncHandler(async (_req, res) => {
  const restaurant = await restaurantService.get();
  return sendSuccess(res, 200, "Restaurante obtenido", restaurant);
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.update(req.body);
  return sendSuccess(res, 200, "Restaurante actualizado", restaurant);
});
