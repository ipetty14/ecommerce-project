const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add New Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const shortDescription = req.body.shortDescription;
  const secondImageUrl = req.body.secondImageUrl ? req.body.secondImageUrl : '';
  const sizing = req.body.sizing ? req.body.sizing : [];
  const inStock = req.body.inStock ? true : false;
  const isPopular = req.body.isPopular ? true : false;
  const productDetails = req.body.productDetails;

  const product = new Product(
    null,
    title,
    price,
    imageUrl,
    description,
    shortDescription,
    secondImageUrl,
    sizing,
    inStock,
    isPopular,
    productDetails
  );
  product.save();
  res.redirect('/products');
};

exports.getEditProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id, (product) => {
    if (!product) {
      return res.redirect('/products');
    }

    res.render('admin/edit-product', {
      product: product,
      editing: true,
      pageTitle: 'Edit Product',
      path: `/admin/products/edit/${id}`,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const shortDescription = req.body.shortDescription;
  const secondImageUrl = req.body.secondImageUrl ? req.body.secondImageUrl : '';
  const sizing = req.body.sizing ? req.body.sizing : [];
  const inStock = req.body.inStock ? true : false;
  const isPopular = req.body.isPopular ? true : false;
  const productDetails = req.body.productDetails;

  const product = new Product(
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
    productDetails
  );
  product.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteById(productId);

  res.redirect('/admin/products');
};
