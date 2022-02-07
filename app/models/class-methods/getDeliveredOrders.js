const MongoDbConnection = require('../MongoDbConnection');

const getDeliveredOrders = () => {
  return MongoDbConnection.deliveredOrders.find().toArray()
  .catch(error => console.log('🚀 ~ error', error));
}

module.exports = getDeliveredOrders;
