import { app } from "./app";
import { runStartupTasks } from "./config/bootstrap";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger, redactConnectionString } from "./utils/logger";

const start = async () => {
  try {
    logger.info("Starting API", {
      nodeEnv: env.nodeEnv,
      port: env.port,
      clientUrl: env.clientUrl,
      publicMenuBaseUrl: env.publicMenuBaseUrl,
      mongoUri: redactConnectionString(env.mongoUri),
      logFormat: env.logFormat,
      autoSeedAdmin: env.autoSeedAdmin,
    });

    await connectDatabase();
    await runStartupTasks();

    app.listen(env.port, () => {
      logger.info("API listening", { url: `http://localhost:${env.port}` });
    });
  } catch (error) {
    logger.error("Unable to start API", error);
    process.exit(1);
  }
};

void start();
