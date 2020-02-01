const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer'); // for images & multipart
const jimp = require('jimp'); // to resize images
const uuid = require('uuid'); // gives unique identifiers for images, so two people can both upload an image with same name

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That file type isn\'t allowed!'}, false)
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if(!req.file) {
    next(); // skip to next middleware
  }
  // console.log(req.file);
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`; //uuid generates unique string
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO); // width of 800 and height is auto
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going
  next();
}

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
  req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own the store in order to edit it!');
  }
}

exports.editStore = async (req, res) => {
  // 1. Find the store given the index
  // res.json(req.params)
  const store = await Store.findOne({_id: req.params.id})
  // res.json(store);
  // 2. Confirm they are the owner of the store
  confirmOwner(store, req.user);
  // 3. Render out the edit form so that the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store: store});
}

exports.updateStore = async (req, res) => {
  // location of store
  // req.body.location.type = 'Point';
  // 1. Find an update the store
  // 2. Redirect them to the store and tell them it worked
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true,   // <- MongoDB method. Takes 3 parameters: query, data, options. New: true means it will return the new store instead of the old one
  runValidators: true, // force model to run required validators again (such as that a name is required)
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoresBySlug = async (req, res, next) => {
  // res.json(req.params);
  // res.send('it works')
  const store = await Store.findOne({ slug: req.params.slug })
    .populate('author'); // when we get the store, it will find the user associated with it and populate the author in the object
  // res.json(store);
  if(!store) return next();
  res.render('store', {store, title: store.name })
}

exports.getStoresByTag = async (req, res) => {
  // res.send('it works');
  // const tags = await Store.getTagsList(); //getTagsList is a static method we are writing on our Store Model.
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true }; // if there is no tag (as in just /tags) then just return all tags
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]); // waiting for both promises to come back; takes as long as the longest promise
  // res.json(result) // [tags, stores] was result before destructuring

  res.render('tag', { tags: tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
// res.json(req.query);
const stores = await Store.find({
  $text: {
    $search: req.query.q
  }
}, { // dont need this additional object. Can run with just search above.
  score: { $meta: 'textScore'} // adding a field (i.e. 'projecting' in mongodb) base on textscore (how many times query search is in name or dsecription, the more the better)
}).sort({
  score: { $meta: 'textScore'} // sort by textScore
})
// limit to only 5 results
.limit(5);
res.json(stores);
}
