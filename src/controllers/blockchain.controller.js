import sanitizeHtml from "sanitize-html";

export function createBlockchainController({ deps }) {
  const { chain } = deps;

  function sanitizeUsername(u) {
    return sanitizeHtml(String(u || ""), { allowedTags: [], allowedAttributes: {} });
  }

  const getBlocks = (req, res) => res.json(chain.chain);

  const createTransaction = async (req, res) => {
    const { toAddress, amount } = req.body || {};
    const fromAddress = sanitizeUsername(req.user?.username);

    const result = await deps.blockchainService.addTransaction({ fromAddress, toAddress, amount });

    if (!result.ok) return res.status(400).json({ message: result.message });
    return res.json({ message: "Transaction added and synced." });
  };

  const mineBlock = async (req, res) => {
    const minerAddress = sanitizeUsername(req.user?.username);
    const result = await deps.blockchainService.mine({ minerAddress });
    return res.json({ message: result.message });
  };

  const getBalance = (req, res) => {
    const requestedAddress = String(req.params.address || "");
    const loggedInUser = String(req.user?.username || "");

    if (requestedAddress !== loggedInUser) {
      return res.status(403).json({ message: "Access denied. You can only view your own balance." });
    }

    const balance = deps.blockchainService.getBalance(requestedAddress);
    return res.json({ address: requestedAddress, balance });
  };

  const syncFromPeer = (req, res) => {
    const peerChain = req.body;
    const ok = deps.blockchainService.tryReplaceChainFromPeer(peerChain, "http");
    if (ok) return res.json({ message: "Chain updated from peer" });
    return res.json({ message: "Chain rejected (shorter or invalid)" });
  };

  const getPending = (req, res) => {
    const pending = deps.blockchainService.getPendingTransactions();
    return res.json(pending);
  };

  return {
    getBlocks,
    createTransaction,
    mineBlock,
    getBalance,
    syncFromPeer,
    getPending
  };
}
