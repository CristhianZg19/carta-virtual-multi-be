import { env } from "./env";
import { User } from "../models/user.model";
import { restaurantService } from "../services/restaurant.service";
import { logger } from "../utils/logger";

export const ensureAdminUser = async () => {
  const restaurant = await restaurantService.ensureDefaultRestaurant();
  const existing = await User.findOne({
    restaurantId: restaurant._id,
    email: env.adminSeedEmail.toLowerCase(),
  });

  if (!existing) {
    await User.create({
      restaurantId: restaurant._id,
      name: env.adminSeedName,
      email: env.adminSeedEmail,
      password: env.adminSeedPassword,
      role: "ADMIN",
      isActive: true,
    });

    logger.info("Admin seed user created", {
      email: env.adminSeedEmail,
      restaurantSlug: restaurant.slug,
      role: "ADMIN",
    });
    return;
  }

  if (env.adminSeedResetPassword) {
    existing.name = env.adminSeedName;
    existing.restaurantId = restaurant._id;
    existing.password = env.adminSeedPassword;
    existing.role = "ADMIN";
    existing.isActive = true;
    await existing.save();

    logger.info("Admin seed user password reset", {
      email: env.adminSeedEmail,
      restaurantSlug: restaurant.slug,
      role: "ADMIN",
    });
    return;
  }

  logger.info("Admin seed user already exists", {
    email: existing.email,
    restaurantSlug: restaurant.slug,
    role: existing.role,
    isActive: existing.isActive,
  });
};

export const runStartupTasks = async () => {
  if (!env.autoSeedAdmin) {
    logger.info("Admin auto seed skipped", {
      autoSeedAdmin: false,
    });
    return;
  }

  await ensureAdminUser();
};
