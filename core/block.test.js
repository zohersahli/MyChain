import Block from "./block.js";

describe('Block Class', () => {
  test('should create a block with correct data', () => {
    const transactions = [{ from: 'Alice', to: 'Bob', amount: 50 }];
    const block = new Block(1, '2025-01-01', transactions, 'previous-hash-123');

    expect(block.index).toBe(1);
    expect(block.timestamp).toBe('2025-01-01');
    expect(block.transactions).toBe(transactions);
    expect(block.previousHash).toBe('previous-hash-123');
    expect(block.hash).toBeDefined();
  });

  test('should return same hash for same data', () => {
    const txs = [{ from: 'A', to: 'B', amount: 10 }];
    const block1 = new Block(2, '2025-01-02', txs, 'abc');
    const block2 = new Block(2, '2025-01-02', txs, 'abc');

    expect(block1.hash).toBe(block2.hash);
  });
});
