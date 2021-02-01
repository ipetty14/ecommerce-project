const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const id = req.params.id;

  Product.findById(id)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: `/products`,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchPopular()
    .then((popularProducts) => {
      res.render('shop/index', {
        prods: popularProducts,
        pageTitle: 'Basketball E-Commerce',
        path: '/',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll()
      .then((products) => {
        const cartProducts = [];
        for (product of products) {
          const cartProductData = cart.products.find(
            (prod) => prod._id === product._id
          );
          if (cartProductData) {
            cartProducts.push({
              productData: product,
              quantity: cartProductData.quantity,
            });
          }
        }

        res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: cartProducts,
          totalPrice: cart.totalPrice,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect('/cart');
};

exports.deleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.deleteProduct(productId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
};
