import { dishService } from "../services/dish.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const listDishes = asyncHandler(async (req, res) => {
  const result = await dishService.list(req.restaurant!.id, req.query);
  return sendSuccess(res, 200, "Platos obtenidos", result.items, result.meta);
});

export const getDish = asyncHandler(async (req, res) => {
  const dish = await dishService.getById(req.restaurant!.id, req.params.id);
  return sendSuccess(res, 200, "Plato obtenido", dish);
});

export const createDish = asyncHandler(async (req, res) => {
  const dish = await dishService.create(req.restaurant!.id, req.body);
  return sendSuccess(res, 201, "Plato creado", dish);
});

export const updateDish = asyncHandler(async (req, res) => {
  const dish = await dishService.update(req.restaurant!.id, req.params.id, req.body);
  return sendSuccess(res, 200, "Plato actualizado", dish);
});

export const deleteDish = asyncHandler(async (req, res) => {
  const dish = await dishService.remove(req.restaurant!.id, req.params.id);
  return sendSuccess(res, 200, "Plato eliminado", dish);
});
