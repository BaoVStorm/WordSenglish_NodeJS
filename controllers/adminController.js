const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const AdminLog = require('../models/AdminLog');


// [1] Thêm mới log
exports.addAdminLog = async (req, res) => {
  try {
    const {admin_id, admin_name, action_type, target_type, target_id, description } = req.body;

    if (!action_type || !target_type) {
      return res.status(400).json({ msg: "Thiếu thông tin bắt buộc." });
    }

    const objectIdAdmin = new mongoose.Types.ObjectId(admin_id);

    const newLog = await AdminLog.create({
      admin_id: objectIdAdmin,
      admin_name,
      action_type,
      target_type,
      target_id,
      description,
    });

    return res.status(201).json({ msg: "Đã ghi log thao tác admin.", log: newLog });

  } catch (err) {
    console.error("Error in addAdminLog:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// [2] Lấy tất cả log và định dạng thời gian
exports.getAllAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ created_at: -1 });

    const formattedLogs = logs.map(log => ({
      ...log._doc,
      created_at_formatted: moment(log.created_at).tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY | HH:mm:ss")
    }));

    return res.status(200).json({ msg: "Lấy danh sách logs thành công", logs: formattedLogs });

  } catch (err) {
    console.error("Error in getAllAdminLogs:", err);
    return res.status(500).json({ msg: err.message });
  }
};


exports.getAdminLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const adminLogs = await AdminLog.find()
      .sort({ created_at: -1 })
      .limit(limit);

    // Chuyển định dạng ngày
    const formattedLogs = adminLogs.map(log => ({
      ...log._doc,
      created_at: moment(log.created_at)
        .tz('Asia/Ho_Chi_Minh')
        .format('DD-MM-YYYY | HH:mm:ss')
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('Lỗi lấy danh sách adminLogs:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
