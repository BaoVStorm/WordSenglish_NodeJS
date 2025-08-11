const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');
const loveController = require('../controllers/loveController');

router.post('/toggleLove', user_jwt, loveController.toggleLove);

module.exports = router;
