const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.find()
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
  const userId = req.user._id;

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
  const inStock = req.body.inStock ? true : false;
  const isPopular = req.body.isPopular ? true : false;

  Product.findById(id)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      product.shortDescription = shortDescription;
      product.inStock = inStock;
      product.isPopular = isPopular;

      return product.save();
    })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
