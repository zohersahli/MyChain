import { Router } from "express";
import { createBlockchainController } from "../controllers/blockchain.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

export function buildBlockchainRoutes({ deps }) {
  const router = Router();
  const ctrl = createBlockchainController({ deps });

  // Public
  router.get("/blocks", ctrl.getBlocks);
  router.post("/sync", ctrl.syncFromPeer);

  // Protected
  const auth = authenticateToken(deps.env.JWT_SECRET);
  router.post("/transactions", auth, ctrl.createTransaction);
  router.get("/mine", auth, ctrl.mineBlock);
  router.get("/balance/:address", auth, ctrl.getBalance);
  router.get("/pending-transactions", auth, ctrl.getPending);


  return router;
}
