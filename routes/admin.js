const path = require('path');

const express = require('express');

const {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} = require('../controllers/admin');

const router = express.Router();

router.get('/products', getProducts);

// // /admin/add-product => GET
router.get('/add-product', getAddProduct);

// // /admin/add-product => POST
router.post('/add-product', postAddProduct);

router.get('/products/edit/:id', getEditProduct);

router.post('/edit-product', postEditProduct);

router.post('/delete-product', postDeleteProduct);

module.exports = router;
