import { Dish, type IDish } from "../models/dish.model";
import { AppError } from "../utils/errors";
import { resolveImageUrl } from "../utils/images";
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
    imageUrl: resolveImageUrl(dish.image),
  };
};

export const dishService = {
  async list(query: DishQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = {};

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

  async getById(id: string) {
    const dish = await Dish.findById(id).populate("categoryId", "name order isActive");
    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },

  async create(payload: DishPayload) {
    const dish = await Dish.create(payload);
    await dish.populate("categoryId", "name order isActive");
    return serializeDish(dish);
  },

  async update(id: string, payload: DishPayload) {
    const dish = await Dish.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate("categoryId", "name order isActive");

    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },

  async remove(id: string) {
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) throw new AppError("Plato no encontrado", 404);
    return serializeDish(dish);
  },
};
