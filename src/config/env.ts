import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/restaurant_menu",
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  publicMenuUrl: process.env.PUBLIC_MENU_URL ?? "http://localhost:5173/menu",
  gcpImagesBaseUrl:
    process.env.GCP_IMAGES_BASE_URL ??
    "https://storage.googleapis.com/bucket-name/restaurant/platos",
  adminSeedName: process.env.ADMIN_SEED_NAME ?? "Administrador",
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "admin@restaurant.com",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "Admin12345",
};

export const isProduction = env.nodeEnv === "production";
