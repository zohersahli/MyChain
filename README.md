# MyChain – Custom Cryptocurrency Blockchain Project 

This project was built as a final assignment for the course **Krypto Valuta och Nätverk**, implementing a complete blockchain system with user authentication, mining, transaction validation, node synchronization, and a modern web interface.

---

## Features

- Custom blockchain with genesis block, mining, and reward system.
- User registration & login using JWT.
- Transaction handling with balance validation and reward logic.
- Mining functionality that creates blocks and distributes rewards.
- Peer-to-peer synchronization between multiple nodes (WebSocket + HTTP).
- TDD (Test Driven Development) using Jest.
- Security against NoSQL Injection, XSS, and DDoS attacks.
- Frontend built using **React + Vite**.

---

## Technologies Used

- Node.js + Express
- MongoDB
- JWT (Json Web Token)
- WebSocket
- React + Vite
- Jest (for unit testing)
- Helmet, Rate Limiting, and Mongo Sanitize for security

---

## Prerequisites

- Node.js installed
- MongoDB
- Copy `.env.example` to `.env` and configure it
- Copy `frontend/.env.example` to `frontend/.env` and configure it

---

## How to Run the Project

### 1. Install Dependencies

```bash
# Backend
cd project-3
npm install

# Frontend
cd frontend
npm install
```

### 2. Start Backend Nodes

**Terminal 1 - Node 1 (Port 3001):**
```bash
cd project-3
npm run node1
```

**Terminal 2 - Node 2 (Port 3002) - Optional:**
```bash
cd project-3
npm run node2
```

### 3. Start Frontend

**Terminal 3:**
```bash
cd project-3/frontend
npm run dev
```

## Running Tests (Jest)

```bash
npm test
```

## Assignment Requirements Coverage
| Requirement                             |Status|
| --------------------------------------- | ---- |
| Custom Blockchain                       | Done |
| Transaction Pool + Validation           | Done |
| Mining + Reward Transaction             | Done |
| Multi-node sync via WebSocket/HTTP      | Done |
| MongoDB for users, transactions, blocks | Done |
| JWT-based user auth                     | Done |
| React + Vite Frontend                   | Done |
| Block & transaction lists               | Done |
| Mining via UI                           | Done |
| TDD & Clean Code                        | Done |
| Security (XSS, NoSQL, RateLimit)        | Done |

---
## Author

Developed by Zoher Sahli – blockchain and full-stack developer student