const jwt = require('jsonwebtoken');
const config = require('./config');

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, config.secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = user; // Stockez l'utilisateur dans la demande pour un accès ultérieur
    next();
  });
}

module.exports = authenticateToken;
