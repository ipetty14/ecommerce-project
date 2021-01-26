const path = require('path');

const express = require('express');

const {
  getAddProduct,
  postAddProduct,
  getProducts,
} = require('../controllers/admin');
const { route } = require('./shop');

const router = express.Router();

router.get('/products', getProducts);

// /admin/add-product => GET
router.get('/add-product', getAddProduct);

// /admin/add-product => POST
router.post('/add-product', postAddProduct);

module.exports = router;
