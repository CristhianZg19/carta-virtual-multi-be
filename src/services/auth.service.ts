import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Restaurant, type IRestaurant } from "../models/restaurant.model";
import { User, type IUser } from "../models/user.model";
import { loginTraceService } from "./loginTrace.service";
import { AppError } from "../utils/errors";
import { normalizeRestaurantSlug } from "../utils/restaurant";

interface LoginRequestMeta {
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

const findRestaurantForUser = async (user: IUser) => {
  const restaurant = await Restaurant.findOne({ _id: user.restaurantId, isActive: true });
  if (!restaurant) throw new AppError("Empresa no disponible", 403);
  return restaurant;
};

const publicUser = (user: IUser, restaurant: IRestaurant) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  restaurantId: user.restaurantId.toString(),
  restaurant: {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
  },
});

const signToken = (user: IUser) =>
  jwt.sign(
    { role: user.role, restaurantId: user.restaurantId.toString() },
    env.jwtSecret as Secret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    },
  );

export const authService = {
  async login(email: string, password: string, restaurantSlug?: string, meta: LoginRequestMeta = {}) {
    let restaurant: IRestaurant | null = null;
    let user: IUser | null = null;
    const identifier = email.toLowerCase();
    const requestedRestaurantSlug = restaurantSlug ? normalizeRestaurantSlug(restaurantSlug) : "";
    const filter: Record<string, unknown> = { email: email.toLowerCase(), isActive: true };

    try {
      if (restaurantSlug) {
        restaurant = await Restaurant.findOne({
          slug: requestedRestaurantSlug,
          isActive: true,
        });
        if (!restaurant) throw new AppError("Restaurante no encontrado", 404);
        filter.restaurantId = restaurant._id;
      }

      const users = await User.find(filter).select("+password").limit(2);
      if (!users.length) {
        throw new AppError("Credenciales invalidas", 401);
      }

      if (!restaurantSlug && users.length > 1) {
        throw new AppError("Indica el restaurante para iniciar sesion", 400);
      }

      user = users[0];

      if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Credenciales invalidas", 401);
      }

      restaurant = restaurant ?? (await findRestaurantForUser(user));

      await loginTraceService.record({
        actorType: "BUSINESS_ADMIN",
        identifier,
        userId: user._id,
        userName: user.name,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        success: true,
        ...meta,
      });

      return {
        token: signToken(user),
        user: publicUser(user, restaurant),
      };
    } catch (error) {
      await loginTraceService.record({
        actorType: "BUSINESS_ADMIN",
        identifier,
        userId: user?._id,
        userName: user?.name,
        restaurantId: restaurant?._id,
        restaurantName: restaurant?.name,
        restaurantSlug: restaurant?.slug || requestedRestaurantSlug,
        success: false,
        failureReason: error instanceof Error ? error.message : "Error desconocido",
        ...meta,
      });

      throw error;
    }
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const restaurant = await findRestaurantForUser(user);
    return publicUser(user, restaurant);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select("+password");
    if (!user || !user.isActive) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError("Contrasena actual incorrecta", 400);
    }

    user.password = newPassword;
    await user.save();

    const restaurant = await findRestaurantForUser(user);
    return publicUser(user, restaurant);
  },
};
