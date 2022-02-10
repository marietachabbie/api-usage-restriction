const { MongoClient } = require('mongodb');

class MongoDbConnection {
    static getClient(){
        const connectionOptions = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            keepAlive: true
        };

        return new MongoClient(
            process.env.URI,
            connectionOptions
        );
    };

    static init(){
        const client = this.getClient();

        client.on('serverOpening', () => this.onServerOpening());
        client.on('serverClosed', () => this.onServerClosing());

        return client.connect()
        .then(() => { this.deliveredOrders = client.db('ordershistoryDB').collection('delivered') })
        .catch((error) => this.catchConnectionError(error));
    };

    static getCollection(){
        this.init();
    };

    static onServerOpening(){
        console.log('Successfully connected!');
    };

    static onServerClosing(){
        console.log('Server disconnected!');
    };

    static catchConnectionError(error){
        console.error(`Connection error: \n${error.message}`);
    };
}

module.exports = MongoDbConnection;
