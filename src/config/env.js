// Centralized environment config loader.

export function loadEnv() {
  const PORT = Number(process.env.PORT || 3001);

  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/blockchainDB";

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }

  // Peers list format: http://localhost:3001,http://localhost:3002
  const PEERS = (process.env.PEERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return { PORT, MONGODB_URI, JWT_SECRET, PEERS };
}
