const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class User {
  constructor(id, username, email) {
    this._id = id ? new mongodb.ObjectID(id) : null;
    this.username = username;
    this.email = email;
  }

  save() {
    const db = getDb();
    let dbOperation;

    if (this._id) {
      dbOperation = db
        .collection('users')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOperation = db.collection('users').insertOne(this);
    }
    return dbOperation
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(userId) {
    const db = getDb();
    const userObjectId = new mongodb.ObjectID(userId);

    return db
      .collection('users')
      .findOne({ _id: userObjectId })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByUsername(username) {
    const db = getDb();

    return db
      .collection('users')
      .find({ username: username })
      .next()
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByEmail(email) {
    const db = getDb();

    return db
      .collection('users')
      .find({ email: email })
      .next()
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
