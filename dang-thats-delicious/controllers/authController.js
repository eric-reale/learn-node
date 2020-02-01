const passport = require('passport'); // library we use to log users in
const crypto = require('crypto'); // built into Node to generate random tokens
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {  // could replace local with facebook, github, etc.
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  //first check if user is authenticate
  if (req.isAuthenticated()) { // checks with passport if user is authenticated
    next();
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // 1. See if that user exists
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    req.flash('error', 'A password has been emailed to you.'); // don't tell users if a user with that email exists
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  mail.send({
    user,
    subject: 'Password Reset',
    resetURL,
    filename: 'password-reset'
  });

  req.flash('success', `You have been emailed a password reset link.`);
  res.redirect('/login');
  // 4. Redirect to login page
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // check if expiration date is greater than right now
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
res.render('reset',  {title: 'Reset Your Password'})
}

exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm'])
  {
    next(); // keep it going
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back')
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // check if expiration date is greater than right now
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined; // how you clear out some data in MongoDB
  user.resetPasswordExpires = undefined; // how you clear out some data in MongoDB
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Your password has been reset!');
  res.redirect('/');
}
