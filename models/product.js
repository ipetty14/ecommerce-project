const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(
    id,
    title,
    price,
    imageUrl,
    description,
    shortDescription,
    secondImageUrl,
    sizing,
    inStock,
    isPopular,
    productDetails,
    userId
  ) {
    this._id = id ? new mongodb.ObjectID(id) : null;
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this.shortDescription = shortDescription;
    this.secondImageUrl = secondImageUrl;
    this.sizing = sizing;
    this.inStock = inStock;
    this.isPopular = isPopular;
    this.productDetails = productDetails;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOperation;

    if (this._id) {
      dbOperation = db
        .collection('products')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOperation = db.collection('products').insertOne(this);
    }
    return dbOperation
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(productId) {
    const db = getDb();
    const productObjectId = new mongodb.ObjectID(productId);

    return db
      .collection('products')
      .find({ _id: productObjectId })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchPopular() {
    const db = getDb();
    return db
      .collection('products')
      .find({ isPopular: true })
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static deleteById(productId) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({
        _id: new mongodb.ObjectID(productId),
      })
      .then((result) => {
        console.log('Product ' + productId + ' was successfully deleted.');
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;
