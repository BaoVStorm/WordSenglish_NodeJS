const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const VocabulariesController = require('../controllers/UserStarsController');

// ----------- function
// lấy tất cả các test trong database
router.post('/getWordUserStars', VocabulariesController.getWordUserStars);
router.post('/addWordUserStars', user_jwt, VocabulariesController.addWordUserStars);
router.post('/removeWordUserStars', user_jwt, VocabulariesController.removeWordUserStars);
router.post('/removeWordUserStarsById', user_jwt, VocabulariesController.removeWordUserStarsById);

router.get('/getUserStarCount', VocabulariesController.getUserStarCount);

// admin
router.get('/getUserStarCountByWeek', VocabulariesController.getUserStarCountByWeek);

module.exports = router;