const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers'); // just importing catchErrors(fn) from errorHandlers.js

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);

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

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

router.get('/hearts', catchErrors(storeController.getHearts));

router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

router.get('/top', catchErrors(storeController.getTopStores));

router.get('/api/search', catchErrors(storeController.searchStores));
router.post('/api/stores/:id/heart', authController.isLoggedIn, catchErrors(storeController.heartStore));

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
