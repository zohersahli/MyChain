import { Router } from "express";
import { createAuthController } from "../controllers/auth.controller.js";

export function buildAuthRoutes({ deps }) {
  const router = Router();
  const ctrl = createAuthController({ deps });

  router.post("/register", ctrl.register);
  router.post("/login", ctrl.login);

  return router;
}
