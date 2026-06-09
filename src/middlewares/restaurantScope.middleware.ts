import type { RequestHandler } from "express";
import { Restaurant } from "../models/restaurant.model";
import { AppError } from "../utils/errors";
import { normalizeRestaurantSlug, restaurantToScope } from "../utils/restaurant";

interface ScopeOptions {
  required?: boolean;
  allowInactive?: boolean;
}

const getRestaurantSlug = (req: Parameters<RequestHandler>[0]) => {
  const raw =
    req.params.restaurantSlug ??
    req.query.restaurantSlug ??
    req.headers["x-restaurant-slug"];

  return typeof raw === "string" ? normalizeRestaurantSlug(raw) : "";
};

export const resolveRestaurantScope =
  (options: ScopeOptions = {}): RequestHandler =>
  async (req, _res, next) => {
    try {
      const required = options.required ?? true;
      const slug = getRestaurantSlug(req);
      const filter: Record<string, unknown> = {};
      let fromAuthenticatedUser = false;

      if (slug) {
        filter.slug = slug;
      } else if (req.user?.restaurantId) {
        filter._id = req.user.restaurantId;
        fromAuthenticatedUser = true;
      } else if (!required) {
        next();
        return;
      } else {
        throw new AppError("Restaurante requerido", 400);
      }

      if (!options.allowInactive && !fromAuthenticatedUser) {
        filter.isActive = true;
      }

      const restaurant = await Restaurant.findOne(filter);
      if (!restaurant) {
        throw new AppError("Restaurante no encontrado", 404);
      }

      req.restaurant = restaurantToScope(restaurant);
      next();
    } catch (error) {
      next(error);
    }
  };
