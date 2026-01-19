import { Router } from "express";
import { buildAuthRoutes } from "./auth.routes.js";
import { buildBlockchainRoutes } from "./blockchain.routes.js";

export function buildRoutes({ deps }) {
  const router = Router();

  router.use(buildAuthRoutes({ deps }));
  router.use(buildBlockchainRoutes({ deps }));

  return router;
}
