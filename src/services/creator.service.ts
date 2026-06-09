import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { CreatorAdmin, type ICreatorAdmin } from "../models/creatorAdmin.model";
import { Restaurant, type IRestaurant } from "../models/restaurant.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/errors";
import { normalizeRestaurantSlug } from "../utils/restaurant";

export const defaultCreatorAdmin = {
  name: "Cristhian",
  username: "Cris19",
  password: "12345678",
};

interface CreateCompanyPayload {
  restaurant: {
    name: string;
    slug?: string;
    description?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    openingHours?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
}

const publicCreator = (creator: ICreatorAdmin) => ({
  id: creator._id.toString(),
  name: creator.name,
  username: creator.username,
  isActive: creator.isActive,
});

const signToken = (creator: ICreatorAdmin) =>
  jwt.sign(
    { type: "CREATOR_ADMIN" },
    env.jwtSecret as Secret,
    {
      subject: creator._id.toString(),
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    },
  );

const buildUrl = (slug: string, path: string) => {
  const baseUrl = env.publicMenuBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}/${slug}${path}`;
};

const publicCompany = (restaurant: IRestaurant | null) => {
  if (!restaurant) throw new AppError("Empresa no encontrada", 404);

  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    storageFolder: restaurant.storageFolder,
    isActive: restaurant.isActive,
    urls: {
      publicMenu: buildUrl(restaurant.slug, "/menu"),
      adminLogin: buildUrl(restaurant.slug, "/admin/login"),
    },
    createdAt: restaurant.createdAt,
    updatedAt: restaurant.updatedAt,
  };
};

export const creatorService = {
  async ensureDefaultCreatorAdmin() {
    const existing = await CreatorAdmin.findOne({ username: defaultCreatorAdmin.username });
    if (existing) return existing;

    return CreatorAdmin.create({
      ...defaultCreatorAdmin,
      isActive: true,
    });
  },

  async login(username: string, password: string) {
    const creator = await CreatorAdmin.findOne({ username, isActive: true }).select("+password");

    if (!creator || !(await creator.comparePassword(password))) {
      throw new AppError("Credenciales invalidas", 401);
    }

    return {
      token: signToken(creator),
      user: publicCreator(creator),
    };
  },

  async me(creatorId: string) {
    const creator = await CreatorAdmin.findById(creatorId);
    if (!creator || !creator.isActive) {
      throw new AppError("Usuario creador no encontrado", 404);
    }

    return publicCreator(creator);
  },

  async changePassword(creatorId: string, currentPassword: string, newPassword: string) {
    const creator = await CreatorAdmin.findById(creatorId).select("+password");
    if (!creator || !creator.isActive) {
      throw new AppError("Usuario creador no encontrado", 404);
    }

    if (!(await creator.comparePassword(currentPassword))) {
      throw new AppError("Contrasena actual incorrecta", 400);
    }

    creator.password = newPassword;
    await creator.save();

    return publicCreator(creator);
  },

  async listCompanies() {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    return restaurants.map((restaurant) => publicCompany(restaurant));
  },

  async updateCompanyStatus(id: string, isActive: boolean) {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true },
    );

    return publicCompany(restaurant);
  },

  async createCompany(payload: CreateCompanyPayload) {
    const slug = normalizeRestaurantSlug(payload.restaurant.slug || payload.restaurant.name);
    const existingRestaurant = await Restaurant.exists({ slug });

    if (existingRestaurant) {
      throw new AppError("Ya existe una empresa con ese slug", 409);
    }

    const restaurant = await Restaurant.create({
      name: payload.restaurant.name,
      slug,
      storageFolder: slug,
      description: payload.restaurant.description ?? "",
      address: payload.restaurant.address ?? "",
      phone: payload.restaurant.phone ?? "",
      whatsapp: payload.restaurant.whatsapp ?? "",
      openingHours: payload.restaurant.openingHours ?? "",
      socialLinks: {
        instagram: "",
        facebook: "",
        tiktok: "",
        website: "",
      },
      brandColors: {
        primary: payload.restaurant.primaryColor || "#173c34",
        accent: payload.restaurant.accentColor || "#d96b43",
      },
      isActive: true,
    });

    const admin = await User.create({
      restaurantId: restaurant._id,
      name: payload.admin.name,
      email: payload.admin.email,
      password: payload.admin.password,
      role: "ADMIN",
      isActive: true,
    });

    return {
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        slug: restaurant.slug,
        storageFolder: restaurant.storageFolder,
      },
      urls: {
        publicMenu: buildUrl(restaurant.slug, "/menu"),
        adminLogin: buildUrl(restaurant.slug, "/admin/login"),
      },
      credentials: {
        restaurantSlug: restaurant.slug,
        name: admin.name,
        email: admin.email,
        password: payload.admin.password,
      },
      storage: {
        dishes: `empresas/${restaurant.storageFolder}/platos`,
        logos: `empresas/${restaurant.storageFolder}/logos`,
      },
    };
  },
};
