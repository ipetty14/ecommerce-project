const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerSendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const envs = require('../config');

const transporter = nodemailer.createTransport(
  nodemailerSendgridTransport({
    auth: {
      api_key: envs.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    message: req.flash(),
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // Validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      message: req.flash(),
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: validationErrors.array(),
    });
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          message: req.flash(),
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcryptjs
        .compare(password, user.password)
        .then((passwordsMatch) => {
          if (passwordsMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }

              res.redirect('/');
            });
          }

          req.flash('error', 'Invalid email or password.');
          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            message: req.flash(),
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          res.redirect('/login');
          console.log(err);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }

    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    message: req.flash(),
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // Validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      message: req.flash(),
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: validationErrors.array(),
    });
  }

  bcryptjs
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [], totalPrice: 0 },
      });

      return newUser.save();
    })
    .then((result) => {
      req.flash('success', 'User created successfully. Try logging in.');
      return transporter.sendMail({
        to: email,
        from: envs.SENDGRID_FROM_EMAIL,
        subject: 'Bored Games Signup Successful!',
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=Edge"><!--<![endif]--><!--[if (gte mso 9)|(IE)]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><!--[if (gte mso 9)|(IE)]><style type="text/css">body {width: 600px;margin: 0 auto;}table {border-collapse: collapse;}table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}img {-ms-interpolation-mode: bicubic;}</style><![endif]--><style type="text/css">body, p, div {font-family: arial,helvetica,sans-serif;font-size: 14px;}body {color: #000000;}body a {color: #42ee99;text-decoration: none;}p { margin: 0; padding: 0; }table.wrapper {width:100% !important;table-layout: fixed;-webkit-font-smoothing: antialiased;-webkit-text-size-adjust: 100%;-moz-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}img.max-width {max-width: 100% !important;}.column.of-2 {width: 50%;}.column.of-3 {width: 33.333%;}.column.of-4 {width: 25%;}@media screen and (max-width:480px) {.preheader .rightColumnContent,.footer .rightColumnContent {text-align: left !important;}.preheader .rightColumnContent div,.preheader .rightColumnContent span,.footer .rightColumnContent div,.footer .rightColumnContent span {text-align: left !important;}.preheader .rightColumnContent,.preheader .leftColumnContent {font-size: 80% !important;padding: 5px 0;}table.wrapper-mobile {width: 100% !important;table-layout: fixed;}img.max-width {height: auto !important;max-width: 100% !important;}a.bulletproof-button {display: block !important;width: auto !important;font-size: 80%;padding-left: 0 !important;padding-right: 0 !important;}.columns {width: 100% !important;}.column {display: block !important;width: 100% !important;padding-left: 0 !important;padding-right: 0 !important;margin-left: 0 !important;margin-right: 0 !important;}.social-icon-column {display: inline-block !important;}}</style><!--user entered Head Start-->        <!--End Head user entered--></head><body><center class="wrapper" data-link-color="#42ee99" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#ffffff;"><div class="webkit"><table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#ffffff"><tr><td valign="top" bgcolor="#ffffff" width="100%"><table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td width="100%"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><!--[if mso]><center><table><tr><td width="600"><![endif]--><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center"><tr><td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;"><tr><td role="module-content"><p></p></td></tr></table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="vB9TDziyvx65CC2nx3oyRH"><tbody><tr><td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#6366f1"></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="hL6wjQ2qknNd5qDwT1p7Up" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#6366f1; padding:10px 20px 10px 20px; line-height:40px; text-align:justify;" height="100%" valign="top" bgcolor="#6366f1"><div><h1 style="text-align: center"><span style="color: #ffffff; font-size: 28px; font-family: verdana, geneva, sans-serif"><strong>Welcome to Bored Games!</strong></span></h1><div></div></div></td></tr></tbody></table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="37c1DUYE1TN31PTwSNoaE7"><tbody><tr><td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px; background-color:#000000;" valign="top" align="center"><a href="https://ancient-hollows-08631.herokuapp.com/"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" src="http://cdn.mcauto-images-production.sendgrid.net/2607c274ae89df61/abee4727-4c7e-4c62-b030-ae2026b57f94/6000x4000.jpg" alt="Bored Games" width="600" data-responsive="true" data-proportionally-constrained="false"></a></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="qk51Jjn4bm3rn2Yb31Dxzb" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#ffffff; padding:50px 50px 10px 50px; line-height:22px; text-align:center;" height="100%" valign="top" bgcolor="#ffffff"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 24px; font-family: verdana, geneva, sans-serif"><strong>YOU\'VE JOINED A FAMILY OF BOARD GAME LOVERS.&nbsp;</strong></span></div><div></div></div></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="iTBXe9c6QUCujvmJs8hYKr" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#ffffff; padding:40px 40px 40px 40px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="#ffffff"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 16px; font-family: verdana, geneva, sans-serif">Whether in a group of friends or with your closest family, board games will bring you closer together... and maybe a little farther apart if you get too heated 🔥&nbsp;</span></div><div style="font-family: inherit; text-align: inherit"><br></div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 16px; font-family: verdana, geneva, sans-serif">Hop on over and check out the latest selection!</span></div><div></div></div></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed" width="100%" data-muid="qY8ouFUf6bFVP8tHkQ5gq7"><tbody><tr><td align="center" bgcolor="#ffffff" class="outer-td" style="padding:20px 20px 60px 20px; background-color:#ffffff;"><table border="0" cellpadding="0" cellspacing="0" class="button-css__deep-table___2OZyb wrapper-mobile" style="text-align:center"><tbody><tr><td align="center" bgcolor="#6366f1" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a style="background-color:#6366f1; border:0px solid #08b65d; border-color:#08b65d; border-radius:0px; border-width:0px; color:#ffffff; display:inline-block; font-family:verdana,geneva,sans-serif; font-size:16px; font-weight:normal; letter-spacing:3px; line-height:30px; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" href="https://ancient-hollows-08631.herokuapp.com/" target="_blank">Shop Now!</a></td></tr></tbody></table></td></tr></tbody></table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c3nRrjMndqXf1snYDFPSF9"><tbody><tr><td style="padding:0px 0px 0px 0px;" role="module-content" height="100%" valign="top" bgcolor="#000000"><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="3px" style="line-height:3px; font-size:3px;"><tbody><tr><td style="padding:0px 0px 3px 0px;" bgcolor="#6366f1"></td></tr></tbody></table></td></tr></tbody></table><div data-role="module-unsubscribe" class="module unsubscribe-css__unsubscribe___2CDlR" role="module" data-type="unsubscribe" style="background-color:#6366f1; color:#ffffff; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:center;" data-muid="vqq9VGfbTmLsFG2U3YC8Fh"><div class="Unsubscribe--addressLine"></div><p style="font-family:verdana,geneva,sans-serif; font-size:12px; line-height:20px;"><a target="_blank" class="Unsubscribe--unsubscribeLink zzzzzzz" href="{{{unsubscribe}}}" style="color:#ffffff;">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="color:#ffffff;">Unsubscribe Preferences</a></p></div><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="vKe4rfbECMPFgNz27Wg5EW"><tbody><tr><td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#6366f1"></td></tr></tbody></table></td></tr></table><!--[if mso]></td></tr></table></center><![endif]--></td></tr></table></td></tr></table></td></tr></table></div></center></body></html>
        `,
      });
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getResetPassword = (req, res, next) => {
  res.render('auth/reset-password', {
    pageTitle: 'Reset Password',
    path: '/reset-password',
    message: req.flash(),
    oldInput: {
      email: '',
    },
    validationErrors: [],
  });
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;

  // Validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('auth/reset-password', {
      pageTitle: 'Reset Password',
      path: '/reset-password',
      message: req.flash(),
      oldInput: {
        email: email,
      },
      validationErrors: validationErrors.array(),
    });
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Something went wrong. Please try again.');
      return res.redirect('/reset-password');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('No user found with email entered.');
          return res.redirect('reset-password');
        }

        user.resetPasswordToken = token;
        user.resetPasswordTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        req.flash(
          'success',
          'Reset password email sent. Please check your email.'
        );
        return transporter.sendMail({
          to: email,
          from: envs.SENDGRID_FROM_EMAIL,
          subject: 'Bored Games Password Reset',
          html: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=Edge"><!--<![endif]--><!--[if (gte mso 9)|(IE)]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><!--[if (gte mso 9)|(IE)]><style type="text/css">body {width: 600px;margin: 0 auto;}table {border-collapse: collapse;}table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}img {-ms-interpolation-mode: bicubic;}</style><![endif]--><style type="text/css">body, p, div {font-family: arial,helvetica,sans-serif;font-size: 14px;}body {color: #000000;}body a {color: #42ee99;text-decoration: none;}p { margin: 0; padding: 0; }table.wrapper {width:100% !important;table-layout: fixed;-webkit-font-smoothing: antialiased;-webkit-text-size-adjust: 100%;-moz-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}img.max-width {max-width: 100% !important;}.column.of-2 {width: 50%;}.column.of-3 {width: 33.333%;}.column.of-4 {width: 25%;}@media screen and (max-width:480px) {.preheader .rightColumnContent,.footer .rightColumnContent {text-align: left !important;}.preheader .rightColumnContent div,.preheader .rightColumnContent span,.footer .rightColumnContent div,.footer .rightColumnContent span {text-align: left !important;}.preheader .rightColumnContent,.preheader .leftColumnContent {font-size: 80% !important;padding: 5px 0;}table.wrapper-mobile {width: 100% !important;table-layout: fixed;}img.max-width {height: auto !important;max-width: 100% !important;}a.bulletproof-button {display: block !important;width: auto !important;font-size: 80%;padding-left: 0 !important;padding-right: 0 !important;}.columns {width: 100% !important;}.column {display: block !important;width: 100% !important;padding-left: 0 !important;padding-right: 0 !important;margin-left: 0 !important;margin-right: 0 !important;}.social-icon-column {display: inline-block !important;}}</style><!--user entered Head Start--><!--End Head user entered--></head><body><center class="wrapper" data-link-color="#42ee99" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#ffffff;"><div class="webkit"><table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#ffffff"><tr><td valign="top" bgcolor="#ffffff" width="100%"><table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td width="100%"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><!--[if mso]><center><table><tr><td width="600"><![endif]--><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center"><tr><td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;"><tr><td role="module-content"><p></p></td></tr></table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="vB9TDziyvx65CC2nx3oyRH"><tbody><tr><td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#6366f1"></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="hL6wjQ2qknNd5qDwT1p7Up" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#6366f1; padding:10px 20px 10px 20px; line-height:40px; text-align:justify;" height="100%" valign="top" bgcolor="#6366f1"><div><h1 style="text-align: center"><span style="color: #ffffff">You forgot something...</span></h1><div></div></div></td></tr></tbody></table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="37c1DUYE1TN31PTwSNoaE7"><tbody><tr><td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px; background-color:#000000;" valign="top" align="center"><a href="https://ancient-hollows-08631.herokuapp.com/"><img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" src="https://media.giphy.com/media/3ohzdYJK1wAdPWVk88/giphy.gif" alt="Bored Games" width="600" data-responsive="true" data-proportionally-constrained="false"></a></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="qk51Jjn4bm3rn2Yb31Dxzb" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#ffffff; padding:50px 50px 10px 50px; line-height:22px; text-align:center;" height="100%" valign="top" bgcolor="#ffffff"><div><div style="font-family: inherit; text-align: inherit"><span style="font-size: 24px; font-family: verdana, geneva, sans-serif"><strong>Click below to reset your password</strong></span></div><div></div></div></td></tr></tbody></table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="iTBXe9c6QUCujvmJs8hYKr" data-mc-module-version="2019-10-22"><tbody><tr><td style="background-color:#ffffff; padding:40px 40px 40px 40px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="#ffffff"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #000000">Please note: This link will expire one hour from the time this email was sent. If you did not request a password reset then please disregard this email.</span></div><div></div></div></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed" width="100%" data-muid="qY8ouFUf6bFVP8tHkQ5gq7"><tbody><tr><td align="center" bgcolor="#ffffff" class="outer-td" style="padding:20px 20px 60px 20px; background-color:#ffffff;"><table border="0" cellpadding="0" cellspacing="0" class="button-css__deep-table___2OZyb wrapper-mobile" style="text-align:center"><tbody><tr><td align="center" bgcolor="#6366f1" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a style="background-color:#6366f1; border:0px solid #08b65d; border-color:#08b65d; border-radius:0px; border-width:0px; color:#ffffff; display:inline-block; font-family:verdana,geneva,sans-serif; font-size:16px; font-weight:normal; letter-spacing:3px; line-height:30px; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" href="https://ancient-hollows-08631.herokuapp.com/reset-password/${token}" target="_blank">Reset Password</a></td></tr></tbody></table></td></tr></tbody></table><table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c3nRrjMndqXf1snYDFPSF9"><tbody><tr><td style="padding:0px 0px 0px 0px;" role="module-content" height="100%" valign="top" bgcolor="#000000"><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="3px" style="line-height:3px; font-size:3px;"><tbody><tr><td style="padding:0px 0px 3px 0px;" bgcolor="#6366f1"></td></tr></tbody></table></td></tr></tbody></table><div data-role="module-unsubscribe" class="module unsubscribe-css__unsubscribe___2CDlR" role="module" data-type="unsubscribe" style="background-color:#6366f1; color:#ffffff; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:center;" data-muid="vqq9VGfbTmLsFG2U3YC8Fh"><p style="font-family:verdana,geneva,sans-serif; font-size:12px; line-height:20px;"><a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" style="color:#ffffff;">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="color:#ffffff;">Unsubscribe Preferences</a></p></div><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="vKe4rfbECMPFgNz27Wg5EW"><tbody><tr><td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#6366f1"></td></tr></tbody></table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="35xFa9abxGTBYt9yR9BeQ2"><tbody><tr><td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="#6366f1"></td></tr></tbody></table></td></tr></table><!--[if mso]></td></tr></table></center><![endif]--></td></tr></table></td></tr></table></td></tr></table></div></center></body></html>
          `,
        });
      })
      .then((result) => {
        res.redirect('/reset-password');
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render('auth/new-password', {
        pageTitle: 'Choose a new password',
        path: `/reset-password/${token}`,
        userId: user._id.toString(),
        passwordToken: token,
        message: req.flash(),
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.newPassword;
  const confirmNewPassword = req.body.confirmNewPassword;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  // Validate user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).render('auth/new-password', {
      pageTitle: 'Choose a new password',
      path: `/reset-password/${req.body.passwordToken}`,
      userId: req.body.userId,
      passwordToken: req.body.passwordToken,
      message: req.flash(),
      validationErrors: validationErrors.array(),
    });
  }

  User.findOne({
    resetPasswordToken: passwordToken,
    resetPasswordTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcryptjs.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetPasswordToken = null;
      resetUser.resetPasswordTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      req.flash('success', 'Password reset successful! Try logging in.');
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
