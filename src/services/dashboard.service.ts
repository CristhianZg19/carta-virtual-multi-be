import { Category } from "../models/category.model";
import { Dish } from "../models/dish.model";
import { DiningTable } from "../models/table.model";

export const dashboardService = {
  async stats() {
    const [
      totalDishes,
      totalCategories,
      totalTables,
      availableDishes,
      featuredDishes,
      inactiveTables,
    ] = await Promise.all([
      Dish.countDocuments(),
      Category.countDocuments(),
      DiningTable.countDocuments(),
      Dish.countDocuments({ isAvailable: true }),
      Dish.countDocuments({ isFeatured: true }),
      DiningTable.countDocuments({ isActive: false }),
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
