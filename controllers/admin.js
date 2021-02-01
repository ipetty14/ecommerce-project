const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  const userId = req.user._id;

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
    productDetails,
    userId
  );

  product
    .save()
    .then((result) => {
      console.log('Product created successfully.');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
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
      });
    })
    .catch((err) => {
      console.log(err);
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
  const userId = req.user._id;

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
    productDetails,
    userId
  );

  product
    .save()
    .then((result) => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteById(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
