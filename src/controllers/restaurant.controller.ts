import { restaurantService } from "../services/restaurant.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = req.restaurant
    ? await restaurantService.getById(req.restaurant.id)
    : await restaurantService.getDefault();
  return sendSuccess(res, 200, "Restaurante obtenido", restaurant);
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.update(req.restaurant!.id, req.body);
  return sendSuccess(res, 200, "Restaurante actualizado", restaurant);
});
