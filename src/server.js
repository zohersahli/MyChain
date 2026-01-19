import "dotenv/config";

import http from "http";
import { WebSocketServer } from "ws";
import axios from "axios";

import { loadEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";

import Blockchain from "../core/blockchain.js";

import TransactionModel from "./models/Transaction.js";
import UserModel from "./models/User.js";
import BlockModel from "./models/Block.js";
import { createBlockchainService } from "./services/blockchain.service.js";

const env = loadEnv();

// DB
await connectDb(env.MONGODB_URI);

// Domain
const chain = new Blockchain();

// Dependencies injected into routes/controllers/services
const deps = {
  env,
  chain,
  models: {
    TransactionModel,
    UserModel,
    BlockModel
  },
  http: {
    axios
  }
};

// Express App (MVC entrypoint)
const app = createApp({ deps });

// HTTP Server
const server = http.createServer(app);

// WebSocket
const wss = new WebSocketServer({ server });
const sockets = [];

wss.on("connection", (ws) => {
  sockets.push(ws);

  ws.on("close", () => {
    const idx = sockets.indexOf(ws);
    if (idx >= 0) sockets.splice(idx, 1);
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(String(message));
      if (data?.type === "CHAIN_SYNC" && Array.isArray(data.chain)) {
        const incoming = data.chain;

        if (incoming.length > chain.chain.length && chain.isChainValid(incoming)) {
          chain.chain = incoming;
          console.log("Chain updated via WebSocket");
        }
      }
    } catch (err) {
      console.error("Failed to handle WebSocket message:", err);
    }
  });
});

function broadcastChainWS() {
  const msg = JSON.stringify({ type: "CHAIN_SYNC", chain: chain.chain });
  sockets.forEach((socket) => {
    try {
      socket.send(msg);
    } catch {
      // ignore
    }
  });
}

async function broadcastChainHttp() {
  const selfUrl = `http://localhost:${env.PORT}`;
  for (const peer of env.PEERS) {
    if (peer === selfUrl) continue;
    try {
      await axios.post(`${peer}/sync`, chain.chain);
      console.log(`Synced chain to ${peer}`);
    } catch {
      console.log(`Failed to broadcast to ${peer}`);
    }
  }
}

async function syncChainOnStartup() {
  const selfUrl = `http://localhost:${env.PORT}`;
  for (const peer of env.PEERS) {
    if (peer === selfUrl) continue;
    try {
      const response = await axios.get(`${peer}/blocks`);
      const peerChain = response.data;

      if (peerChain.length > chain.chain.length && chain.isChainValid(peerChain)) {
        chain.chain = peerChain;
        console.log(`Replaced chain from ${peer}`);
      }
    } catch {
      console.log(`Failed to sync with ${peer}`);
    }
  }
}

// Expose network helpers to controllers/services via deps
deps.network = {
  broadcastChainWS,
  broadcastChainHttp,
  syncChainOnStartup
};

deps.network.http = { get: axios.get };

deps.blockchainService = createBlockchainService({
  env: deps.env,
  chain: deps.chain,
  models: deps.models,
  network: deps.network
});

server.listen(env.PORT, async () => {
  console.log(`Node listening on port ${env.PORT}`);
  await deps.blockchainService.syncChainOnStartup();
});
