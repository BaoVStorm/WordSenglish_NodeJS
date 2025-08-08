const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const scoreController = require('../controllers/ScoreController');

// ----------- function
// lấy tất cả các test trong database
router.post('/updateScore', scoreController.updateScore);

module.exports = router;
