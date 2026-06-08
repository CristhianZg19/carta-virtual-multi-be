import { Restaurant } from "../models/restaurant.model";
import { AppError } from "../utils/errors";
import { resolveImageUrl } from "../utils/images";

const defaultRestaurant = {
  name: "Casa Aurora",
  logo: "",
  description: "Cocina de temporada, platos frescos y una carta lista para descubrir desde tu mesa.",
  address: "Av. Principal 123",
  phone: "+51 999 888 777",
  whatsapp: "+51999888777",
  openingHours: "Lunes a domingo, 12:00 p.m. - 11:00 p.m.",
  socialLinks: {
    instagram: "https://instagram.com/casaaurora",
    facebook: "",
    tiktok: "",
    website: "",
  },
  brandColors: {
    primary: "#173c34",
    accent: "#d96b43",
  },
  isActive: true,
};

interface RestaurantPayload {
  name?: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  openingHours?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  brandColors?: {
    primary?: string;
    accent?: string;
  };
  isActive?: boolean;
}

export const restaurantService = {
  async get() {
    const restaurant = await Restaurant.findOne().sort({ createdAt: 1 });
    if (restaurant) {
      const item = restaurant.toObject();
      return { ...item, id: restaurant._id.toString(), logoUrl: resolveImageUrl(restaurant.logo) };
    }

    const created = await Restaurant.create(defaultRestaurant);
    const item = created.toObject();
    return { ...item, id: created._id.toString(), logoUrl: resolveImageUrl(created.logo) };
  },

  async update(payload: RestaurantPayload) {
    const restaurant = await Restaurant.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    if (!restaurant) throw new AppError("Restaurante no encontrado", 404);
    const item = restaurant.toObject();
    return { ...item, id: restaurant._id.toString(), logoUrl: resolveImageUrl(restaurant.logo) };
  },
};
