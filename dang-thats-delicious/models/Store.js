const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now // when you create a store, MongoDB will set created property to Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
      address: {
        type: String,
        required: 'You must supply an address!'
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // author is the user; an object of the instance of that user
      required: "Must enter author"
    }
});

// Define our indexes for MongoDB searches
storeSchema.index({
  name: 'text',
  description: 'text'
})

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx }) // search Store databased for matching store names
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`; // adding a number to name of store for url
  }
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([  // look up Mongo aggregates for more methods; useful for querying
     { $unwind: '$tags' }, // unwind will create a separate object for each instance of a tag. So a store with two tags will get two unique objects, each with one tag
     { $group: { _id: '$tags', count: { $sum: 1} }},
     { $sort: { count: -1 }} // 1 is sort ascending, -1 is descending
  ]);
}

module.exports = mongoose.model('Store', storeSchema);
