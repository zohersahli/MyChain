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

## How to Run the Project

# 1. Backend (Node.js)

```bash
cd project-3
npm install
node nodeServer.js       # Main node on port 3001
node nodeServer2.js      # Optional second node on port 3002.

---
# 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev

##  Running Tests (Jest)
```bash
npm test

Test Coverage:

 Transaction Class
 Block Class
 Blockchain Class (balance, mining, validation)

 
---

 Security Measures
JWT authentication for all private routes

Sanitized user input (using sanitize-html)

Protected against NoSQL injections and XSS

Rate limiting enabled to prevent brute-force and abuse



---
Assignment Requirements Coverage
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
Author
Developed by Zoher Sahli – blockchain and full-stack developer student