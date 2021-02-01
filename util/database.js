const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://ecommerceRWUser:lTdbvYuW3b6AQ8Vd@cluster0.ghwmn.mongodb.net/shop?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((client) => {
      console.log('Connected!');
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database connection!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
