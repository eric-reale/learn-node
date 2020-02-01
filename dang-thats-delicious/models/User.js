const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5'); // for gravatar
const validator = require('validator'); // validation package for emails in NodeJS
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose'); // for passwords & authentications

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please enter a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Store'} // one to many relationship. One user, many stores
  ]
});

userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email' }); // email address is the username for authentication
userSchema.plugin(mongodbErrorHandler); // handles the errors passed to users

module.exports = mongoose.model('User', userSchema);
