const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 50;
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(0, '2025-01-01T00:00:00.000Z', 'Genesis Block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid(chain = this.chain) {
    for (let i = 1; i < chain.length; i++) {
      const current = chain[i];
      const previous = chain[i - 1];

      const recalculatedHash = this.calculateBlockHash(current);
      if (current.hash !== recalculatedHash) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }
    }

    return true;
  }

  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(minerAddress) {
  // First: Add the reward transaction
  this.pendingTransactions.push(
    new Transaction(null, minerAddress, this.miningReward)
  );

  //Then create the block with the current transactions.
  const block = new Block(
    this.chain.length,
    new Date().toISOString(),
    this.pendingTransactions,
    this.getLatestBlock().hash
  );

  block.mineBlock(this.difficulty);
  this.chain.push(block);

  // Reset transactions
  this.pendingTransactions = [];
}


  // We calculate how much currency a particular address owns by tracking transactions across all blocks.

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  calculateBlockHash(block) {
    const crypto = require('crypto');
    const data =
      block.index +
      block.timestamp +
      JSON.stringify(block.transactions) +
      block.previousHash +
      block.nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = Blockchain;
