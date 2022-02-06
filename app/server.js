require('dotenv').config()

const express = require('express');
const app = express();
const MongoDbConnection = require('./MongoDbConnection');
const jwt = require('jsonwebtoken');
app.use(express.json());

const getDeliveredOrders = () => {
  return MongoDbConnection.deliveredOrders.find().toArray()
  .catch(error => console.log('🚀 ~ error', error));
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.get('/posts', authenticateToken, (req, res) => {
  getDeliveredOrders()
  .then((posts) => res.json(posts.filter(post => post.username === req.user.name)))
  .catch(error => console.log('🚀 ~ error', error))
})

app.post('/login', (req, res) => {
  // auth

  const username = req.body.username
  const user = { name: username }

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
  res.json({ accessToken })
})

const main = () => {
  MongoDbConnection.init()
  .then(() => app.listen(3000))
  .catch (error => console.log('🚀 ~ error', error));
}

main();
