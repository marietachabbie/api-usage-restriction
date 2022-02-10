const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const utils = require('../helpers/utils');
const authenticateToken = utils.authenticateToken;
const output = utils.output;
const getDeliveredOrders = require('../models/class-methods/getDeliveredOrders');

router.get('/orders/delivered', authenticateToken, (req, res) => {
  return getDeliveredOrders()
  .then((deliveredOrders) => res.json(deliveredOrders))
  .catch(error => output(error));
});

router.get('/home', (req, res) => {
  res.send('Welcome to home page')
});

router.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken });
});

module.exports = router;
