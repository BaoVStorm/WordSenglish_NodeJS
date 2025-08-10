const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const testController = require('../controllers/testController');

// ----------- function
// lấy tất cả các test trong database
router.get('/getListTest', user_jwt, testController.getListTest);

// lấy thông tin test
router.get('/getTest', user_jwt, testController.getTest);

// lấy thông tin part
router.get('/getPart', user_jwt, testController.getPart);

// lấy danh sách các part
router.get('/getListPart', user_jwt, testController.getListPart);

// lấy thông tin cụ thể của test (nhiều nhóm câu hỏi)
router.get('/getListGroupQuestion', user_jwt, testController.getListGroupQuestion);

    // lấy thông tin cụ thể của test (nhiều nhóm câu hỏi)
    router.get('/getGroupQuestionDetail', user_jwt, testController.getGroupQuestionDetail);

// lấy danh sách các câu hỏi thuộc 1 nhóm câu hỏi (list Questions in Group_Question)
router.get('/getListQuestion', user_jwt, testController.getListQuestion);

    // lấy thông tin cụ thể của test (nhiều nhóm câu hỏi)
    router.get('/getQuestionDetail', user_jwt, testController.getQuestionDetail);

    // lấy tất cả câu hỏi của 1 test
    router.get('/getListQuestionByTestId', user_jwt, testController.getListQuestionByTestId);

// ------------- admin ------------
router.get('/getTestAttemptCounts', testController.getTestAttemptCounts);

module.exports = router;
