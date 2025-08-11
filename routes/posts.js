const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const postController = require('../controllers/postController');

// đăng ký tài khoản
router.post('/create', user_jwt, postController.createPostWithVocabs);

// Lấy danh sách các póts
router.get('/posts', user_jwt, postController.getPosts);

module.exports = router;
