import Transaction from "./transaction.js";

describe('Transaction Class', () => {
  test('should create a transaction with correct properties', () => {
    const tx = new Transaction('Alice', 'Bob', 100);

    expect(tx.fromAddress).toBe('Alice');
    expect(tx.toAddress).toBe('Bob');
    expect(tx.amount).toBe(100);
  });
});


