import { Dish, type IDish } from "../models/dish.model";
import { Category } from "../models/category.model";
import { AppError } from "../utils/errors";
import { resolveDishImageUrl } from "../utils/images";
import { getPagination, getPaginationMeta } from "../utils/pagination";

interface DishQuery {
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  tag?: string;
  page?: unknown;
  limit?: unknown;
}

interface DishPayload {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  order?: number;
  tags?: string[];
}

const serializeDish = (dish: IDish) => {
  const item = dish.toObject({ virtuals: true });
  return {
    ...item,
    id: dish._id.toString(),
    imageUrl: resolveDishImageUrl(dish.image),
  };
};

export const dishService = {
  async list(restaurantId: string, query: DishQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { restaurantId };

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { tags: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.categoryId) filter.categoryId = query.categoryId;
    if (typeof query.isAvailable === "boolean") filter.isAvailable = query.isAvailable;
    if (typeof query.isFeatured === "boolean") filter.isFeatured = query.isFeatured;
    if (query.tag) filter.tags = query.tag;

    const [items, total] = await Promise.all([
      Dish.find(filter)
        .populate("categoryId", "name order isActive")
        .sort({ order: 1, name: 1 })
        .skip(skip)
        .limit(limit),
      Dish.countDocuments(filter),
    ]);

    return {
      items: items.map(serializeDish),
      meta: getPaginationMeta(page, limit, total),
    };
  },

  async getById(restaurantId: string, id: string) {
    const dish = await Dish.findOne({ _id: id, restaurantId }).populate(
      "categoryId",
      "name order isActive",
    );
    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },

  async create(restaurantId: string, payload: DishPayload) {
    if (payload.categoryId) {
      const category = await Category.exists({ _id: payload.categoryId, restaurantId });
      if (!category) throw new AppError("Categoria no encontrada", 404);
    }

    const dish = await Dish.create({ ...payload, restaurantId });
    await dish.populate("categoryId", "name order isActive");
    return serializeDish(dish);
  },

  async update(restaurantId: string, id: string, payload: DishPayload) {
    if (payload.categoryId) {
      const category = await Category.exists({ _id: payload.categoryId, restaurantId });
      if (!category) throw new AppError("Categoria no encontrada", 404);
    }

    const dish = await Dish.findOneAndUpdate({ _id: id, restaurantId }, payload, {
      new: true,
      runValidators: true,
    }).populate("categoryId", "name order isActive");

    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },

  async remove(restaurantId: string, id: string) {
    const dish = await Dish.findOneAndDelete({ _id: id, restaurantId });
    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },
};
