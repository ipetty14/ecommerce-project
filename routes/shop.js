const express = require('express');

const {
  getProducts,
  getProductDetails,
  getIndex,
  getCart,
  postCart,
  getCheckout,
  postOrder,
  getOrders,
  deleteCartItem,
} = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:id', getProductDetails);

router.get('/cart', getCart);

router.post('/add-to-cart', postCart);

router.post('/cart-delete-item', deleteCartItem);

router.post('/create-order', postOrder);

router.get('/orders', getOrders);

// router.get('/checkout', getCheckout);

module.exports = router;
