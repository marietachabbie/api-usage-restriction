require('console-error');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient();
const moment = require('moment');
const public_api_rate_limit = process.env.PUBLIC_API_RATE_LIMIT;
const private_api_rate_limit = process.env.PRIVATE_API_RATE_LIMIT;

const output = (error) => {
  console.error(`❌ ${error.name} occured\n${error.message}`);
};

function* generator(i = 1) {
  while(true)
    yield i++;
};
const counter = generator();

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

const limitRedisClient = (identifier, limit, req, res, next) => {
  redisClient.exists(identifier, (err, reply) => {
    redisClient.on('error', function (err) {
      output(err);
      return;
    });
    if(reply === 1) {
      redisClient.get(identifier, (err, reply) => {
        let data = JSON.parse(reply);
        let currentTime = moment().unix();
        let difference = (currentTime - data.startTime) / 60;
        if(difference >= 1) {
          let body = {
            'count': 1,
            'startTime': moment().unix()
          };
          redisClient.set(identifier, JSON.stringify(body));
          next();
        }
        if(difference < 1) {
          if(data.count == limit) {
            return res.status(429).json({"error": `You exceeded ${limit} requests per hour limit!`});
          };
          data.count++;
          redisClient.set(identifier, JSON.stringify(data));
          next();
        }
      })
    } else {
      let body = {
        'count': 1,
        'startTime': moment().unix()
      };
      redisClient.set(identifier, JSON.stringify(body));
      next();
    };
    const count = counter.next().value;
    const remaining = limit - count > 0 ? limit - count : 0;
    res.set({
      'X-API-Usage-Limit': limit,
      'X-API-Usage-Limit-Remaining': remaining
    });
  });
}

const rateLimitByUser = (req, res, next) => {
  const authToken = req.headers.authorization.split(' ')[1];
  limitRedisClient(authToken, private_api_rate_limit, req, res, next);
};

const rateLimitByIP = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  limitRedisClient(ip, public_api_rate_limit, req, res, next);
};

module.exports = {
  output,
  authenticateToken,
  rateLimitByUser,
  rateLimitByIP
}
