import { jest } from "@jest/globals";
import { createBlockchainService } from "../blockchain.service.js";

function makeDeps({ balance = 10 } = {}) {
  const chain = {
    chain: [],
    getBalanceOfAddress: () => balance,
    addTransaction: jest.fn(),
    minePendingTransactions: jest.fn(),
    getLatestBlock: jest.fn().mockReturnValue({
      index: 1,
      timestamp: new Date().toISOString(),
      transactions: [],
      previousHash: "prev",
      nonce: 0,
      hash: "hash"
    })
  };

  const txSave = jest.fn().mockResolvedValue(undefined);
  const blockSave = jest.fn().mockResolvedValue(undefined);

  const models = {
    TransactionModel: function () {
      return { save: txSave };
    },
    BlockModel: function () {
      return { save: blockSave };
    }
  };

  const network = {
    broadcastChainHttp: jest.fn().mockResolvedValue(undefined),
    broadcastChainWS: jest.fn()
  };

  return { chain, models, network, txSave, blockSave };
}

describe("blockchain.service - transaction validation", () => {
  test("rejects empty toAddress", async () => {
    const { chain, models, network } = makeDeps();
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "", amount: 1 });

    expect(res.ok).toBe(false);
    expect(res.message).toBe("Invalid toAddress.");
    expect(chain.addTransaction).not.toHaveBeenCalled();
    expect(network.broadcastChainHttp).not.toHaveBeenCalled();
  });

  test("rejects non-positive amount", async () => {
    const { chain, models, network } = makeDeps();
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "bob", amount: 0 });

    expect(res.ok).toBe(false);
    expect(res.message).toBe("Invalid transaction amount.");
    expect(chain.addTransaction).not.toHaveBeenCalled();
  });

  test("rejects sending to self", async () => {
    const { chain, models, network } = makeDeps();
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "alice", amount: 1 });

    expect(res.ok).toBe(false);
    expect(res.message).toBe("You cannot send money to yourself.");
    expect(chain.addTransaction).not.toHaveBeenCalled();
  });

  test("rejects insufficient balance", async () => {
    const { chain, models, network } = makeDeps({ balance: 0 });
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "bob", amount: 1 });

    expect(res.ok).toBe(false);
    expect(res.message).toBe("Insufficient balance for this transaction.");
    expect(chain.addTransaction).not.toHaveBeenCalled();
  });

  test("accepts valid transaction and broadcasts", async () => {
    const { chain, models, network } = makeDeps({ balance: 10 });
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "bob", amount: 1 });

    expect(res.ok).toBe(true);
    expect(chain.addTransaction).toHaveBeenCalledTimes(1);
    expect(network.broadcastChainHttp).toHaveBeenCalledTimes(1);
    expect(network.broadcastChainWS).toHaveBeenCalledTimes(1);
  });

  test("persists transaction in MongoDB (TransactionModel.save)", async () => {
    const { chain, models, network, txSave } = makeDeps({ balance: 10 });
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.addTransaction({ fromAddress: "alice", toAddress: "bob", amount: 1 });

    expect(res.ok).toBe(true);
    expect(txSave).toHaveBeenCalledTimes(1);
  });

    test("mine persists block in MongoDB (BlockModel.save) and broadcasts", async () => {
    const { chain, models, network, blockSave } = makeDeps();
    const svc = createBlockchainService({ chain, models, network });

    const res = await svc.mine({ minerAddress: "miner" });

    expect(res.ok).toBe(true);
    expect(chain.minePendingTransactions).toHaveBeenCalledTimes(1);
    expect(blockSave).toHaveBeenCalledTimes(1);
    expect(network.broadcastChainHttp).toHaveBeenCalledTimes(1);
    expect(network.broadcastChainWS).toHaveBeenCalledTimes(1);
  });

});
