const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey'; // Same key as in nodeServer.js

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // The token usually comes in the form: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user; // We pass the user data inside the request
    next(); // Allow access to the path
  });
}

module.exports = authenticateToken;
