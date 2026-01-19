import Blockchain from "./blockchain.js";
import Transaction from "./transaction.js";

describe('Blockchain Class', () => {
  let chain;

  beforeEach(() => {
    chain = new Blockchain();
  });

  test('should start with Genesis block', () => {
    expect(chain.chain.length).toBe(1);
    expect(chain.chain[0].previousHash).toBe('0');
  });

  test('should add a transaction to pending', () => {
    const tx = new Transaction('Alice', 'Bob', 100);
    chain.addTransaction(tx);
    expect(chain.pendingTransactions.length).toBe(1);
  });

  test('should mine a block and reset pending transactions', () => {
    const tx = new Transaction('Alice', 'Bob', 100);
    chain.addTransaction(tx);
    chain.minePendingTransactions('Miner');

    expect(chain.chain.length).toBe(2); // Genesis + mined block
    expect(chain.pendingTransactions.length).toBe(0); // Reward transaction
  });

  test('should calculate correct balance', () => {
    chain.addTransaction(new Transaction('Alice', 'Bob', 50));
    chain.minePendingTransactions('Bob');

    expect(chain.getBalanceOfAddress('Bob')).toBeGreaterThanOrEqual(50); // Because of reward too
  });

  test('should validate the chain', () => {
    expect(chain.isChainValid()).toBe(true);
  });

  test("should detect tampering", () => {
    chain.addTransaction(new Transaction("Alice", "Bob", 50));
    chain.minePendingTransactions("Miner");

    chain.chain[1].transactions = [{ fromAddress: "Alice", toAddress: "Bob", amount: 9999 }];
    expect(chain.isChainValid()).toBe(false);
  });
});
