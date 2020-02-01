const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login'})
}

exports.registerForm = (req, res) => {
  res.render('register', { title: "Register"});
}

// Middleware registration validations
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name'); // from app.js -> expressValidator();
  req.checkBody('name', 'You must enter a name!').notEmpty();
  req.checkBody('email', 'That email is invalid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match!').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {title: 'Register', body: req.body, flashes: req.flash()}); // re-renders form but passes in data that user has already entered
    return; // stop the fn from running
  }
  next(); // there were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name }); // req.body will pass in form data
  // User.register(user, req.body.password, function(err, user) {}); // old way of doing it
  const register = promisify(User.register, User); // promisify library;
  await register(user, req.body.password); // stores password as a hash in the database
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account'});
}

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findOneAndUpdate(  // query, update, options
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  // res.json(user);
  req.flash('success', 'Updated the profile!');
  res.redirect('/account');   // can res.redirect('back')
}
