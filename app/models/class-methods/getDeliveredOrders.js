const MongoDbConnection = require('../MongoDbConnection');
const output = require('../../helpers/utils').output;

const getDeliveredOrders = () => {
  return MongoDbConnection.deliveredOrders.find().toArray()
  .catch(error => output(error));
}

module.exports = getDeliveredOrders;
