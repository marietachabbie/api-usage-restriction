require('console-error');
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");

const output = (error) => {
  console.error(`❌ ${error.name} occured\n${error.message}`);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
    req.user = user;
    next();
  })
}

const rateLimitByUser = rateLimit({
  keyGenerator: (req, res) => req.headers.authorization,
  windowMs: 1 * 60 * 60 * 1000,
  max: 200,
  message: "You exceeded 200 requests per hour limit!",
  headers: true,
});

const rateLimitByIP = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 100,
  message: "You exceeded 100 requests per hour limit!",
  headers: true,
});

module.exports = {
  output,
  authenticateToken,
  rateLimitByUser,
  rateLimitByIP
}
