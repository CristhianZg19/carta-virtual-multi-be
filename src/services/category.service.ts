import { Category } from "../models/category.model";
import { Dish } from "../models/dish.model";
import { AppError } from "../utils/errors";
import { getPagination, getPaginationMeta } from "../utils/pagination";

interface CategoryQuery {
  search?: string;
  isActive?: boolean;
  page?: unknown;
  limit?: unknown;
}

interface CategoryPayload {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export const categoryService = {
  async list(query: CategoryQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    if (typeof query.isActive === "boolean") {
      filter.isActive = query.isActive;
    }

    const [items, total] = await Promise.all([
      Category.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit),
      Category.countDocuments(filter),
    ]);

    return { items, meta: getPaginationMeta(page, limit, total) };
  },

  async create(payload: CategoryPayload) {
    return Category.create(payload);
  },

  async update(id: string, payload: CategoryPayload) {
    const category = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!category) throw new AppError("Categoria no encontrada", 404);
    return category;
  },

  async remove(id: string) {
    const linkedDishes = await Dish.countDocuments({ categoryId: id });
    if (linkedDishes > 0) {
      throw new AppError("No se puede eliminar una categoria con platos asociados", 409);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError("Categoria no encontrada", 404);
    return category;
  },
};
