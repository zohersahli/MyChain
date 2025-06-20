const Blockchain = require('./core/blockchain');
const Transaction = require('./core/transaction');

// Create a block chain
const myChain = new Blockchain();

// Create some transactions
myChain.addTransaction(new Transaction("Alice", "Bob", 100));
myChain.addTransaction(new Transaction("Bob", "Charlie", 30));

// Mining transactions in a new block
console.log("Mining block...");
myChain.minePendingTransactions("Zoher");

// Print string after mining
console.log(JSON.stringify(myChain, null, 2));

// //Mine again until Zoher receives his reward
console.log("Mining another block to receive the reward...");
myChain.minePendingTransactions("Zoher");

// Check chain validity
console.log("Is chain valid?", myChain.isChainValid());

// We calculate how much currency a particular address owns by tracking transactions across all blocks.
console.log(" Zoher's balance is:", myChain.getBalanceOfAddress("Zoher"));

