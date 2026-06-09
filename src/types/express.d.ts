import type { UserRole } from "./api";
import type { RestaurantScope } from "./api";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        restaurantId: string;
      };
      restaurant?: RestaurantScope;
      creatorAdmin?: {
        id: string;
        username: string;
      };
    }
  }
}

export {};
