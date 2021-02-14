const path = require('path');

const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} = require('../controllers/admin');

const router = express.Router();

const productValidation = [
  body('title', 'The title must be at least 3 characters.')
    .trim()
    .isString()
    .isLength({ min: 3 }),
  body(
    'shortDescription',
    'The short description must be between 5 and 150 characters'
  )
    .trim()
    .isLength({ min: 5, max: 150 }),
  body('price', 'The price must be in the format 100.00').isFloat(),
  body('imageUrl', 'The Image URL must be a valid URL').isURL(),
  body('description', 'The description must be between 5 and 100 characters.')
    .trim()
    .isLength({ min: 5, max: 1000 }),
];

router.get('/products', isAuth, getProducts);

// /admin/add-product => GET
router.get('/add-product', isAuth, getAddProduct);

// /admin/add-product => POST
router.post('/add-product', isAuth, productValidation, postAddProduct);

router.get('/products/edit/:id', isAuth, getEditProduct);

router.post('/edit-product', isAuth, productValidation, postEditProduct);

router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;
