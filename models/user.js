const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: { type: Number, required: true },
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  let newPrice = product.price;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
    totalPrice: this.cart.totalPrice + newPrice,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId, productPrice) {
  const itemToDelete = this.cart.items.filter((item) => {
    return item.productId.toString() === productId.toString();
  });

  const newPrice =
    this.cart.totalPrice - itemToDelete[0].quantity * +productPrice;

  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart = {
    items: updatedCartItems,
    totalPrice: newPrice,
  };

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [], totalPrice: 0 };

  return this.save();
};

module.exports = mongoose.model('User', userSchema);
