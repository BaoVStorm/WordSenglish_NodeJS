const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const VocabulariesController = require('../controllers/VocabulariesController');

// ----------- function
// lấy tất cả các test trong database
router.post('/getListWords', user_jwt, VocabulariesController.getListWords);

router.get('/getListVocabLevels', VocabulariesController.getListVocabLevels);
router.get('/getListVocabTopics', VocabulariesController.getListVocabTopics);

// ----------- admin
router.get('/getVocabularyByTopicAndLevel', VocabulariesController.getVocabularyByTopicAndLevel);
router.post('/getDetailWord', VocabulariesController.getDetailWord);

router.post('/addVocabTopic', VocabulariesController.addVocabTopic);
router.post('/addVocabLevel', VocabulariesController.addVocabLevel);
router.post('/addVocabulary', VocabulariesController.addVocabulary);

router.post('/updateVocabulary', VocabulariesController.updateVocabulary);
router.post('/deleteVocabulary', VocabulariesController.deleteVocabulary);

module.exports = router;