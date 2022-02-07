require('dotenv').config()

const express = require('express');
const app = express();
const MongoDbConnection = require('./models/MongoDbConnection');
const postRouts = require('./routes/posts');

app.use(express.json());
app.use('/', postRouts);

const main = () => {
  MongoDbConnection.init()
  .then(() => app.listen(3000))
  .catch (error => console.log('🚀 ~ error', error));
}

main();
