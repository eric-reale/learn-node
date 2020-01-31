const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); // just importing catchErrors(fn) from errorHandlers.js

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)); // use catchErrors instead of try/catch in async/await

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)); // use catchErrors instead of try/catch in async/await

router.get('/store/:slug', catchErrors(storeController.getStoresBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

// router.get('/', storeController.myMiddleware, storeController.homePage);

// router.get('/', (req, res) => {
//   const wes = { name: 'wes', age: 100, cool: true}
//   // res.send('Hey! It works!');
//   // res.json(wes);
//   // res.send(req.query.name);
//   res.render('hello', {
//     name: 'wes',
//     dog: 'snickers'
//     // ^^ or req.query.dog in order to pass in whatever the user submitted
//   });
// });

// router.get('/reverse/:name', (req, res) => {
// const reverse = [...req.params.name].reverse().join('');
// res.send(reverse);
// });


module.exports = router;
