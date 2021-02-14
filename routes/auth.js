const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');

router.get('/login', getLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid value for the email field. Please try again.')
      .normalizeEmail(),
    body('password', 'Invalid email or password.').trim().isStrongPassword({
      returnScore: true,
    }),
  ],
  postLogin
);
router.post('/logout', postLogout);

router.get('/signup', getSignup);
router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid value for the email field. Please try again.')
      .custom((value, { req }) => {
        return User.findOne({ email: email }).then((user) => {
          if (user) {
            return Promise.reject(
              'User e-mail already exists. Try logging in.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Password must be at least 8 characters and contain one uppercase and lowercase letter, one number, and one symbol.'
    )
      .trim()
      .isStrongPassword({
        returnScore: true,
      }),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match!');
        }

        return true;
      }),
  ],
  postSignup
);

router.get('/reset-password', getResetPassword);
router.post(
  '/reset-password',
  body('email')
    .isEmail()
    .withMessage('Invalid value for the email field. Please try again.')
    .normalizeEmail(),
  postResetPassword
);

router.get('/reset-password/:token', getNewPassword);
router.post(
  '/new-password',
  [
    body(
      'newPassword',
      'Password must be at least 8 characters and contain one uppercase and lowercase letter, one number, and one symbol.'
    )
      .trim()
      .isStrongPassword({
        returnScore: true,
      }),
    body('confirmNewPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match!');
        }

        return true;
      }),
  ],
  postNewPassword
);

module.exports = router;
