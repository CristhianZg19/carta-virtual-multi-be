import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProduction } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRoutes } from "./routes";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (!isProduction) {
  app.use(morgan("dev"));
}

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
