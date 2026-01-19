import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import { buildRoutes } from "./routes/index.js";

export function createApp({ deps }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests, try again later."
    })
  );

  app.use(buildRoutes({ deps }));

  return app;
}
