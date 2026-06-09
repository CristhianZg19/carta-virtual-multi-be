import slugify from "slugify";
import type { IRestaurant } from "../models/restaurant.model";
import type { RestaurantScope } from "../types/api";

export const normalizeRestaurantSlug = (value: string) =>
  slugify(value, { lower: true, strict: true }) || "restaurante";

export const restaurantToScope = (restaurant: IRestaurant): RestaurantScope => ({
  id: restaurant._id.toString(),
  name: restaurant.name,
  slug: restaurant.slug,
  storageFolder: restaurant.storageFolder || restaurant.slug,
});

export const requireRestaurantScope = (scope?: RestaurantScope) => {
  if (!scope) {
    throw new Error("Restaurant scope is required");
  }

  return scope;
};
