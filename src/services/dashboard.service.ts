import { Category } from "../models/category.model";
import { Dish } from "../models/dish.model";
import { DiningTable } from "../models/table.model";

export const dashboardService = {
  async stats(restaurantId: string) {
    const [
      totalDishes,
      totalCategories,
      totalTables,
      availableDishes,
      featuredDishes,
      inactiveTables,
    ] = await Promise.all([
      Dish.countDocuments({ restaurantId }),
      Category.countDocuments({ restaurantId }),
      DiningTable.countDocuments({ restaurantId }),
      Dish.countDocuments({ restaurantId, isAvailable: true }),
      Dish.countDocuments({ restaurantId, isFeatured: true }),
      DiningTable.countDocuments({ restaurantId, isActive: false }),
    ]);

    return {
      totalDishes,
      totalCategories,
      totalTables,
      availableDishes,
      featuredDishes,
      inactiveTables,
    };
  },
};
