import { categoryService } from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export const listCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.list(req.restaurant!.id, req.query);
  return sendSuccess(res, 200, "Categorias obtenidas", result.items, result.meta);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.restaurant!.id, req.body);
  return sendSuccess(res, 201, "Categoria creada", category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.restaurant!.id, req.params.id, req.body);
  return sendSuccess(res, 200, "Categoria actualizada", category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.remove(req.restaurant!.id, req.params.id);
  return sendSuccess(res, 200, "Categoria eliminada", category);
});
