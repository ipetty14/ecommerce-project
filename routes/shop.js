const express = require('express');
const isAuth = require('../middleware/is-auth');

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

router.get('/cart', isAuth, getCart);

router.post('/add-to-cart', isAuth, postCart);

router.post('/cart-delete-item', isAuth, deleteCartItem);

router.post('/create-order', isAuth, postOrder);

router.get('/orders', isAuth, getOrders);

// router.get('/checkout', getCheckout);

module.exports = router;
