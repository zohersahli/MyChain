import Block from "../../core/block.js";
import Transaction from "../../core/transaction.js";

export function createBlockchainService({ env, chain, models, network }) {
  async function syncChainOnStartup() {
    const selfUrl = `http://localhost:${env.PORT}`;
    const peers = env.PEERS.filter((p) => p !== selfUrl);

    for (const peer of peers) {
      try {
        const res = await network.http.get(`${peer}/blocks`);
        const peerChain = res.data;
        tryReplaceChainFromPeer(peerChain, peer);
      } catch {
        console.log(`Failed to sync with ${peer}`);
      }
    }
  }

  function tryReplaceChainFromPeer(peerChain, source) {
    if (!Array.isArray(peerChain)) return false;
    if (peerChain.length <= chain.chain.length) return false;
    if (!chain.isChainValid(peerChain)) return false;

    const converted = peerChain.map((b) => {
      const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash);
      block.nonce = b.nonce;
      block.hash = b.hash;
      return block;
    });

    chain.chain = converted;
    console.log(`Chain replaced from ${source}`);
    return true;
  }

  function validateTransactionInput({ fromAddress, toAddress, amount }) {
    if (typeof toAddress !== "string" || toAddress.trim().length === 0) {
      return { ok: false, message: "Invalid toAddress." };
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return { ok: false, message: "Invalid transaction amount." };
    }

    if (toAddress === fromAddress) {
      return { ok: false, message: "You cannot send money to yourself." };
    }

    const balance = chain.getBalanceOfAddress(fromAddress);
    if (balance < amount) {
      return { ok: false, message: "Insufficient balance for this transaction." };
    }

    return { ok: true };
  }

  async function addTransaction({ fromAddress, toAddress, amount }) {
    const v = validateTransactionInput({ fromAddress, toAddress, amount });
    if (!v.ok) return v;

    const tx = new Transaction(fromAddress, toAddress, amount);
    chain.addTransaction(tx);

    const txDoc = new models.TransactionModel({ fromAddress, toAddress, amount });
    await txDoc.save();

    await network.broadcastChainHttp();
    network.broadcastChainWS();

    return { ok: true };
  }

  async function mine({ minerAddress }) {
    chain.minePendingTransactions(minerAddress);

    const latest = chain.getLatestBlock();
    const blockDoc = new models.BlockModel({
      index: latest.index,
      timestamp: latest.timestamp,
      transactions: latest.transactions,
      previousHash: latest.previousHash,
      nonce: latest.nonce,
      hash: latest.hash
    });

    await blockDoc.save();

    await network.broadcastChainHttp();
    network.broadcastChainWS();

    return { ok: true, message: `Block mined and reward sent to ${minerAddress}` };
  }

  function getBlocks() {
    return chain.chain;
  }

  function getBalance(address) {
    return chain.getBalanceOfAddress(address);
  }

  function getPendingTransactions() {
    return chain.pendingTransactions;
  }


  return {
    syncChainOnStartup,
    tryReplaceChainFromPeer,
    addTransaction,
    mine,
    getBlocks,
    getBalance,
    getPendingTransactions
  };
}
