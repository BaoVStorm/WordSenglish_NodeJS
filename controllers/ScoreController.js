const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const Score = require('../models/Score');
const User = require('../models/Users');

// updateScore

exports.updateScore = async (req, res) => {
  try {
    let { user_id, test_id, max_score } = req.body;

    if (!user_id || !test_id || !max_score) {
        return res.status(400).json({ msg: "Missing or invalid parameters" });
    }

    max_score = Number(max_score);

    // Kiểm tra xem điểm đã có chưa
    let score = await Score.findOne({ user_id, test_id });

    if (score) {
      // Nếu đã tồn tại, kiểm tra xem max_score có lớn hơn không
      if (score.max_score < max_score) {
        // Nếu max_score mới lớn hơn, cập nhật lại điểm
        const old_max_score = score.max_score;

        // Cập nhật score trong bảng Score
        score.max_score = max_score;
        await score.save();

        // Cập nhật điểm cho người dùng
        const user = await User.findById(user_id);
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }

        // Tính lại score cho người dùng
        user.score = user.score - old_max_score + max_score;
        await user.save();

        return res.status(200).json({
          msg: "Score updated successfully",
          updated_score: user.score,
        });
      } else {
        return res.status(200).json({ msg: "New max_score is not greater than the existing one" });
      }
    } else {
      // Nếu không tồn tại, tạo mới
      const newScore = new Score({
        user_id,
        test_id,
        max_score
      });
      await newScore.save();

      // Cập nhật điểm cho người dùng
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Cập nhật điểm cho người dùng
      user.score += max_score; // Thêm max_score vào điểm người dùng
      await user.save();

      return res.status(201).json({
        msg: "New score created successfully",
        updated_score: user.score,
      });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};