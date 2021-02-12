const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = process.env.PORT || 3000;
const envs = require('./config');

const USER_ID = envs.USER_ID;
const MONGODB_URI = envs.MONGODB_URI;

const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'shopSessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404 } = require('./controllers/error');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          username: 'ipetty',
          email: 'ipetty@icloud.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
