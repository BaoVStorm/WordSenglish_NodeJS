const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const userController = require('../controllers/userController');

// đăng ký tài khoản
router.post('/register', userController.register);

// đăng ký tài khoản
router.post('/login', userController.login);

// authorization (chỉ có người dùng đã đăng nhập mới có quyền truy cập)
router.get('/verify', user_jwt, userController.getCurrentUser);

// Google Auth
router.post('/googleauth', userController.googleAuth);

// log out
router.get('/logout', user_jwt, userController.logout);

// ----------- function
// Lấy top 5 user theo score giảm dần
router.get('/getTopScore', user_jwt, userController.getTopUsersByScore);
router.get('/getTopScoreByScore', userController.getTopUsersByScore);

router.get('/getUserCount', userController.getUserCount)

router.post('/updateUserInfo', userController.updateUserInfo)


module.exports = router;
