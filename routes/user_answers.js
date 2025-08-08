const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const userAnswersController = require('../controllers/user_answersController');

router.post('/getWrongAnswers', user_jwt, userAnswersController.getWrongAnswers);

router.get('/getWrongPercent', userAnswersController.getWrongPercent);
router.get('/getCorrectPercent', userAnswersController.getCorrectPercent);

module.exports = router;
