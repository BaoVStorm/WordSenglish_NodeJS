const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const userController = require('../controllers/userController');

// đăng ký tài khoản
router.post('/register', userController.register);

router.post('/refresh', userController.refreshToken);

// đăng ký tài khoản
router.post('/login', userController.login);

// log out
router.post('/logout', user_jwt, userController.logout);

// ----------- function
router.get('/profile', user_jwt, userController.profile);


module.exports = router;
