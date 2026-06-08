import mongoose from "mongoose";
import { env } from "./env";
import { logger, redactConnectionString } from "../utils/logger";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  logger.info("Connecting to MongoDB", {
    mongoUri: redactConnectionString(env.mongoUri),
    timeoutMs: env.mongoServerSelectionTimeoutMs,
  });

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    });
    logger.info("MongoDB connected", { database: mongoose.connection.name });
  } catch (error) {
    logger.error("MongoDB connection failed", error, {
      hint:
        "Check MONGODB_URI, Atlas database user credentials, and Atlas Network Access IP allowlist for Render outbound IPs.",
    });
    throw error;
  }
};
