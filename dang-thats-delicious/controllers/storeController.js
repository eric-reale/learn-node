const mongoose = require('mongoose');
const Store = mongoose.model('Store');

// exports.myMiddleware = (req, res, next) => {
//   req.name = 'Wes';
//   // if(req.name === 'Wes') {
//   //   throw Error('This is a stupid name');
//   // }
//   // res.cookie('name', 'Wes is cool', { maxAge: 900000});
//   next();
// }

exports.homePage = (req, res) => {
  // req.flash('error', 'Something happend');
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
};

exports.createStore = async (req, res) => {
  // res.json(req.body); creates JSON of data from form
  const store = await (new Store(req.body)).save();;
  // store.age = 10; // adding in additional data if you want
  // store.cool = true; // adding in additional data if you want
  // await store.save(); // connecting Mongo DB & because of async/await, we will not move on to the next line until the store has saved. Since JS is asynchronous, without this then the code would continue to flow down to next function regardless if it saved or not
  // console.log('it worked!');
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', { title: 'Stores', stores: stores}); // because of ES6 could also just say stores instead of stores: stores
}

exports.editStore = async (req, res) => {
  // 1. Find the store given the index
  // res.json(req.params)
  const store = await Store.findOne({_id: req.params.id})
  // res.json(store);
  // 2. Confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so that the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store: store});
}

exports.updateStore = async (req, res) => {
  // 1. Find an update the store
  // 2. Redirect them to the store and tell them it worked
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true,   // <- MongoDB method. Takes 3 parameters: query, data, options. New: true means it will return the new store instead of the old one
  runValidators: true, // force model to run required validators again (such as that a name is required)
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
};
