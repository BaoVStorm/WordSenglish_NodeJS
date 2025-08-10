const express = require('express');
const router = express.Router();
const user_jwt = require('../middleware/user_jwt');

// - table init
const adminController = require('../controllers/adminController');

// ----------- function

router.post('/addAdminLog', adminController.addAdminLog);
router.get('/getAllAdminLogs', adminController.getAllAdminLogs);

router.get('/getAdminLogs', adminController.getAdminLogs);

module.exports = router;
