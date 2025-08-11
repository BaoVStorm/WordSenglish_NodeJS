const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const commentController = require('../controllers/commentController');

router.get('/getComments', user_jwt, commentController.getCommentsByPost);
router.post('/addComment', user_jwt, commentController.addComment);

module.exports = router;
