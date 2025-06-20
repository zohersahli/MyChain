const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');

const Blockchain = require('./core/blockchain');
const Transaction = require('./core/transaction');

const PORT = 3002;
const app = express();
app.use(express.json());   
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const sockets = [];

wss.on('connection', (ws) => {
  sockets.push(ws);
  console.log('🔌 New WebSocket connection (Node 2)');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'CHAIN_SYNC' && data.chain) {
        const incoming = data.chain;
        if (incoming.length > myChain.chain.length && myChain.isChainValid(incoming)) {
          myChain.chain = incoming;
          console.log('Chain updated via WebSocket (Node 2)');
        }
      }
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  });
});

function broadcastChainWS() {
  const message = JSON.stringify({ type: 'CHAIN_SYNC', chain: myChain.chain });
  sockets.forEach((socket) => socket.send(message));
}

const myChain = new Blockchain();
const peers = ['http://localhost:3001', 'http://localhost:3002'];


app.get('/blocks', (req, res) => {
  res.json(myChain.chain);
});

app.post('/transactions', async (req, res) => {
  const { fromAddress, toAddress, amount } = req.body;
  const tx = new Transaction(fromAddress, toAddress, amount);
  myChain.addTransaction(tx);

  await broadcastChain();
  broadcastChainWS();

  res.json({ message: 'Transaction added and synced.' });
});

app.get('/mine', async (req, res) => {
  const miner = req.query.address || 'miner2';
  myChain.minePendingTransactions(miner);

  await broadcastChain();
  broadcastChainWS();

  res.json({ message: `Block mined and reward sent to ${miner}` });
});

app.get('/balance/:address', (req, res) => {
  const balance = myChain.getBalanceOfAddress(req.params.address);
  res.json({ address: req.params.address, balance });
});

async function syncChain() {
  for (const peer of peers) {
    if (peer === `http://localhost:${PORT}`) continue;

    try {
      const response = await axios.get(`${peer}/blocks`);
      const peerChain = response.data;

      if (peerChain.length > myChain.chain.length && myChain.isChainValid(peerChain)) {
        const Block = require('./core/block');
        const convertedChain = peerChain.map(b => {
          const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash);
          block.nonce = b.nonce;
          block.hash = b.hash;
          return block;
        });
        myChain.chain = convertedChain;
        console.log(`Chain replaced from ${peer}`);
      }
    } catch (err) {
      console.log(`Failed to sync with ${peer}`);
    }
  }
}

async function broadcastChain() {
  for (const peer of peers) {
    if (peer === `http://localhost:${PORT}`) continue;

    try {
      await axios.post(`${peer}/sync`, myChain.chain);
      console.log(`✅ Synced chain to ${peer}`);
    } catch (err) {
      console.log(`Failed to sync with ${peer}`);
    }
  }
}

app.post('/sync', (req, res) => {
  const peerChain = req.body;

  //if (peerChain.length > myChain.chain.length && myChain.isChainValid(peerChain)) {
  if (Array.isArray(peerChain) && peerChain.length > myChain.chain.length && myChain.isChainValid(peerChain)) {
    const Block = require('./core/block');
    const convertedChain = peerChain.map(b => {
      const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash);
      block.nonce = b.nonce;
      block.hash = b.hash;
      return block;
    });

    myChain.chain = convertedChain;
    res.json({ message: 'Chain updated from peer' });
  } else {
    res.json({ message: 'Chain rejected (shorter or invalid)' });
  }
});

server.listen(PORT, () => {
  console.log(`Node 2 listening on port ${PORT}`);
  syncChain();
});
