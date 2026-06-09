import { Restaurant, type IRestaurant } from "../models/restaurant.model";
import { AppError } from "../utils/errors";
import { resolveRestaurantLogoUrl } from "../utils/images";
import { normalizeRestaurantSlug } from "../utils/restaurant";

const defaultRestaurant = {
  name: "Casa Aurora",
  slug: "casa-aurora",
  storageFolder: "casa-aurora",
  logo: "",
  description: "Cocina de temporada, platos frescos y una carta lista para descubrir desde tu mesa.",
  address: "Av. Principal 123",
  phone: "+51 999 888 777",
  whatsapp: "+51999888777",
  showWhatsapp: true,
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
  slug?: string;
  storageFolder?: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  showWhatsapp?: boolean;
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

const serializeRestaurant = (restaurant: IRestaurant | null) => {
  if (!restaurant) throw new AppError("Restaurante no encontrado", 404);
  const item = restaurant.toObject();
  return { ...item, id: restaurant._id.toString(), logoUrl: resolveRestaurantLogoUrl(restaurant.logo) };
};

const normalizePayload = (payload: RestaurantPayload) => ({
  ...payload,
  slug: payload.slug ? normalizeRestaurantSlug(payload.slug) : undefined,
  storageFolder: payload.storageFolder ? normalizeRestaurantSlug(payload.storageFolder) : undefined,
});

export const restaurantService = {
  async getDefault() {
    const restaurant = await Restaurant.findOne().sort({ createdAt: 1 });
    if (restaurant) {
      return serializeRestaurant(restaurant);
    }

    const created = await Restaurant.create(defaultRestaurant);
    return serializeRestaurant(created);
  },

  async getById(id: string) {
    return serializeRestaurant(await Restaurant.findById(id));
  },

  async getBySlug(slug: string) {
    return serializeRestaurant(
      await Restaurant.findOne({ slug: normalizeRestaurantSlug(slug), isActive: true }),
    );
  },

  async ensureDefaultRestaurant() {
    return Restaurant.findOneAndUpdate(
      { slug: defaultRestaurant.slug },
      defaultRestaurant,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  },

  async update(id: string, payload: RestaurantPayload) {
    const normalized = normalizePayload(payload);
    const restaurant = await Restaurant.findByIdAndUpdate(id, normalized, {
      new: true,
      runValidators: true,
    });

    return serializeRestaurant(restaurant);
  },
};
