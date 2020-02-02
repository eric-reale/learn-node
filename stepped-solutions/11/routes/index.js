const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); // just importing catchErrors(fn) from errorHandlers.js

// router.get('/', storeController.getStores);
// router.get('/stores', storeController.getStores);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore)); // use catchErrors instead of try/catch in async/await

module.exports = router;
