const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');


const Blockchain = require('./core/blockchain');
const Transaction = require('./core/transaction');
const authenticateToken = require('./middlewares/authMiddleware');
const TransactionModel = require('./models/Transaction');
const UserModel = require('./models/User');
const BlockModel = require('./models/Block');

const JWT_SECRET = 'supersecretkey';
const PORT = process.env.PORT || 3001;

const app = express();
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.',
}));

const myChain = new Blockchain();
const peers = ['http://localhost:3001', 'http://localhost:3002'];

const wss = new WebSocket.Server({ server });
const sockets = [];

wss.on('connection', (ws) => {
  sockets.push(ws);
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'CHAIN_SYNC' && data.chain) {
        const incoming = data.chain;
        if (incoming.length > myChain.chain.length && myChain.isChainValid(incoming)) {
          myChain.chain = incoming;
          console.log('Chain updated via WebSocket');
        }
      }
    } catch (err) {
      console.error('Failed to handle WebSocket message:', err);
    }
  });
});

function broadcastChainWS() {
  const message = JSON.stringify({ type: 'CHAIN_SYNC', chain: myChain.chain });
  sockets.forEach((socket) => socket.send(message));
}

mongoose.connect('mongodb://localhost:27017/blockchainDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.get('/blocks', (req, res) => {
  res.json(myChain.chain);
});

app.post('/transactions', authenticateToken, async (req, res) => {
  const { toAddress, amount } = req.body;
  const fromAddress = sanitizeHtml(req.user.username); 
  
  const balance = myChain.getBalanceOfAddress(fromAddress);
if (balance < amount) {
  return res.status(400).json({ message: 'Insufficient balance for this transaction.' });
}
if (typeof amount !== 'number' || amount <= 0) {
  return res.status(400).json({ message: 'Invalid transaction amount.' });
}
if (toAddress === fromAddress) {
  return res.status(400).json({ message: 'You cannot send money to yourself.' });
}
const tx = new Transaction(fromAddress, toAddress, amount);
  myChain.addTransaction(tx);

  // save at MongoDB
  const txToSave = new TransactionModel({ fromAddress, toAddress, amount });
  await txToSave.save().catch(err => console.error('Mongo save error:', err));

  await broadcastChain();
  broadcastChainWS();

  res.json({ message: 'Transaction added and synced.' });
});

// Transaction mining
app.get('/mine', authenticateToken, async (req, res) => {
  const miner = sanitizeHtml(req.query.address || 'miner1');
  myChain.minePendingTransactions(miner);

  const latestBlock = myChain.getLatestBlock();
  const blockToSave = new BlockModel({
    index: latestBlock.index,
    timestamp: latestBlock.timestamp,
    transactions: latestBlock.transactions,
    previousHash: latestBlock.previousHash,
    nonce: latestBlock.nonce,
    hash: latestBlock.hash,
  });

  await blockToSave.save().catch(err => console.error('Error saving block:', err));

  await broadcastChain();
  broadcastChainWS();

  res.json({ message: `Block mined and reward sent to ${miner}` });
});

// User balance
app.get('/balance/:address', authenticateToken, (req, res) => {
  const requestedAddress = req.params.address;
  const loggedInUser = req.user.username;

  if (requestedAddress !== loggedInUser) {
    return res.status(403).json({ message: 'Access denied. You can only view your own balance.' });
  }

  const balance = myChain.getBalanceOfAddress(requestedAddress);
  res.json({ address: requestedAddress, balance });
});

// Synchronize the chain from other nodes
async function syncChain() {
  for (const peer of peers) {
    if (peer === `http://localhost:${PORT}`) continue;
    try {
      const response = await axios.get(`${peer}/blocks`);
      const peerChain = response.data;
      if (peerChain.length > myChain.chain.length && myChain.isChainValid(peerChain)) {
        myChain.chain = peerChain;
        console.log(`Replaced chain from ${peer}`);
      }
    } catch (err) {
      console.log(`Failed to sync with ${peer}`);
    }
  }
}

// broadcast the chain to the rest of the nodes.
async function broadcastChain() {
  for (const peer of peers) {
    if (peer === `http://localhost:${PORT}`) continue;
    try {
      await axios.post(`${peer}/sync`, myChain.chain);
      console.log(`Synced chain to ${peer}`);
    } catch (err) {
      console.log(`Failed to broadcast to ${peer}`);
    }
  }
}

// receive sync from other nodes
app.post('/sync', (req, res) => {
  const peerChain = req.body;
  if (peerChain.length > myChain.chain.length && myChain.isChainValid(peerChain)) {
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

// Register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await UserModel.findOne({ username });
    //if (exists) return res.status(400).json({ message: 'Username already exists' });
    if (exists) return res.status(400).json({ message: 'Username already exists (backend)' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Node listening on port ${PORT}`);
  syncChain();
});
