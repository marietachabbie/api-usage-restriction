require('dotenv').config();

const express = require('express');
const app = express();
const MongoDbConnection = require('./models/MongoDbConnection');
const ordersRoute = require('./routes/orders');
const utils = require('./helpers/utils');
const output = utils.output;
const rateLimitByUser = utils.rateLimitByUser;
const rateLimitByIP = utils.rateLimitByIP;

app.set('trust proxy', true);
app.use('/home', rateLimitByIP);
app.use('/login', rateLimitByIP);
app.use('/orders/delivered', rateLimitByUser);

app.use(express.json());
app.use('/', ordersRoute);

const main = () => {
  MongoDbConnection.init()
  .then(() => app.listen(3000))
  .catch (error => output(error));
};

main();
