import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`API running at http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Unable to start API", error);
    process.exit(1);
  }
};

void start();
