const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const postController = require('../controllers/vocabItemController');

// đăng ký tài khoản
router.get('/vocabItems', user_jwt, postController.getVocabItemsByPost);

module.exports = router;
