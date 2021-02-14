const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .select('title price shortDescription imageUrl')
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add New Product',
    path: '/admin/add-product',
    editing: false,
    hasErrors: false,
    message: req.flash(),
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const shortDescription = req.body.shortDescription;
  const inStock = req.body.inStock ? true : false;
  const isPopular = req.body.isPopular ? true : false;
  const userId = req.user;

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('admin/edit-product', {
      product: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        shortDescription: shortDescription,
        inStock: inStock,
        isPopular: isPopular,
      },
      editing: false,
      hasErrors: true,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      message: req.flash(),
    });
  }

  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    shortDescription: shortDescription,
    inStock: inStock,
    isPopular: isPopular,
    userId: userId,
  });

  product
    .save()
    .then((result) => {
      console.log('Product created successfully.');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/products');
      }

      res.render('admin/edit-product', {
        product: product,
        editing: true,
        pageTitle: 'Edit Product',
        path: `/admin/products/edit/${id}`,
        hasErrors: false,
        message: req.flash(),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const shortDescription = req.body.shortDescription;
  const inStock = req.body.inStock ? true : false;
  const isPopular = req.body.isPopular ? true : false;

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: `/admin/products/edit/${req.body.id}`,
      product: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        shortDescription: shortDescription,
        inStock: inStock,
        isPopular: isPopular,
        _id: id,
      },
      editing: true,
      hasErrors: true,
      message: req.flash(),
    });
  }

  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      product.shortDescription = shortDescription;
      product.inStock = inStock;
      product.isPopular = isPopular;

      return product.save().then((result) => {
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
