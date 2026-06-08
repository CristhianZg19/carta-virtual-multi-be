import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/restaurant_menu",
  mongoServerSelectionTimeoutMs: toNumber(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10_000),
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  logFormat: process.env.LOG_FORMAT ?? "text",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  publicMenuUrl: process.env.PUBLIC_MENU_URL ?? "http://localhost:5173/menu",
  gcpImagesBaseUrl:
    process.env.GCP_IMAGES_BASE_URL ??
    "https://storage.googleapis.com/matrimonioxd/platos",
  gcpStorageBucket: process.env.GCP_STORAGE_BUCKET ?? "matrimonioxd",
  gcpImagesPrefix: process.env.GCP_IMAGES_PREFIX ?? "platos",
  gcpProjectId: process.env.GCP_PROJECT_ID ?? "",
  gcpCredentialsJson: process.env.GCP_CREDENTIALS_JSON,
  autoSeedAdmin: toBoolean(process.env.AUTO_SEED_ADMIN),
  adminSeedName: process.env.ADMIN_SEED_NAME ?? "Administrador",
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "admin@restaurant.com",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "Admin12345",
  adminSeedResetPassword: toBoolean(process.env.ADMIN_SEED_RESET_PASSWORD),
};

export const isProduction = env.nodeEnv === "production";
