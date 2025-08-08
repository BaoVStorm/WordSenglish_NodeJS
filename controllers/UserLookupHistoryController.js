const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const UserLookupHistory = require('../models/UserLookupHistory');
const UserStar = require('../models/UserStars');

// ------------- function

// lấy danh sách các test đang có trong database
exports.addLookUpHistory = async (req, res) => {
  try {
    const { user_id, word, meaning, isTranslateEnglish, vocab_id } = req.body;

    if (!user_id || !word || !meaning || !isTranslateEnglish) {
      return res.status(400).json({
        msg: "user_id, word, meaning and isTranslateEnglish are required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // Step 1: Đếm số bản ghi hiện có của user
    const count = await UserLookupHistory.countDocuments({ user_id: objectId_user });

    // Step 2: Nếu >= 20 thì xoá bản ghi cũ nhất
    if (count >= 20) {
      await UserLookupHistory
        .findOneAndDelete({ user_id: objectId_user })
        .sort({ lookup_at: 1 }); // oldest first
    }

    // Step 3: Lưu bản ghi mới
    let data = {
      user_id: objectId_user,
      word,
      meaning,
      isTranslateEnglish
    };

    if (vocab_id) {
      data.vocab_id = new mongoose.Types.ObjectId(vocab_id);
    }

    const newUserLookupHistory = new UserLookupHistory(data);
    const createdUserLookupHistory = await newUserLookupHistory.save();

    return res.status(201).json({
      msg: "UserLookupHistory created successfully",
      UserLookupHistory: createdUserLookupHistory
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.getLookUpHistory = async (req, res) => {
  try {
    const { user_id} = req.body;

    if (!user_id) {
      return res.status(400).json({
        msg: "user_id is required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // 1. Lấy lịch sử tra từ
    const list = await UserLookupHistory.find({user_id: objectId_user}).sort({lookup_at: -1}); // sort theo thời gian mới nhất

    // 2. Lấy danh sách user_lookup_id đã được star
    const userStarred = await UserStar.find({ user_id: objectId_user }, 'user_lookup_id');

    // 3. Tạo Set để kiểm tra nhanh
    const starredLookupIds = new Set(
      userStarred
        .filter(item => item.user_lookup_id) // tránh undefined (rỗng)
        .map(item => item.user_lookup_id.toString())
    );

    // 4. Gắn isStar + chuyển thời gian
    const listUserLookupHistory = list.map(item => {
      const itemObject = item.toObject();
      itemObject.lookup_at_vietnam = moment(item.lookup_at)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY | HH:mm:ss");

      itemObject.isStar = starredLookupIds.has(item._id.toString()); // So sánh theo _id của UserLookupHistory
      return itemObject;
    });

    return res.status(200).json({
      msg: "UserLookupHistory is listed successfully",
      listUserLookupHistory
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.getLookUpCount = async (req, res) => {
  try {
    userLookupCount = await UserLookupHistory.countDocuments();
    res.json(userLookupCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getLookupDoneByWeek = async (req, res) => {
  try {
    const result = await UserLookupHistory.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$lookup_at" }, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          count: 1
        }
      }
    ]);

    // Tạo mảng 7 phần tử, khởi tạo bằng 0
    const testCounts = Array(7).fill(0);

    // Gán số lượng test tương ứng vào từng thứ (Chuyển dayOfWeek Mongo sang [Mon=0, ..., Sun=6])
    result.forEach(item => {
      const mongoDay = item.day; // 1=Sun, 2=Mon, ..., 7=Sat
      const jsDayIndex = (mongoDay + 5) % 7; // chuyển về index JS [Mon=0,...,Sun=6]
      testCounts[jsDayIndex] = item.count;
    });

    return res.status(200).json(testCounts);// [Mon, Tue, Wed, ..., Sun]

  } catch (err) {
    console.error("Error saving answers:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
}

exports.getTopUsersByLookupCount = async (req, res) => {
  try {
    let {number} = req.query;

    if(!number)
      number = 5;
    number = Number(number);

    let result = await UserLookupHistory.aggregate([
      {
        $group: {
          _id: "$user_id",
          lookup_count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users", // tên collection gốc trong MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      {
        $project: {
          _id: 0,
          email: "$user.email",
          full_name: "$user.full_name",
          lookup_count: 1
        }
      },
      { $sort: { lookup_count: -1 } },  // sắp xếp giảm dần
      { $limit: number } // nếu muốn giới hạn top 10
    ]);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMostLookedUpWords = async (req, res) => {
  try {
    let {number} = req.query;

    if(!number)
      number = 5;
    number = Number(number);

    const result = await UserLookupHistory.aggregate([
      {
        $group: {
          _id: "$word",
          lookup_count: { $sum: 1 }
        }
      },
      { $sort: { lookup_count: -1 } }, // Sắp xếp giảm dần
      {
        $project: {
          _id: 0,
          word: "$_id",
          lookup_count: 1
        }
      },
      { $limit: number } // Optional: top 10 từ được tra nhiều nhất
    ]);

    return res.status(200).json(result); // Hoặc return result nếu dùng nội bộ
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.getAllLookupHistorySorted = async (req, res) => {
  try {
    let { number } = req.query;

    if (!number) number = 5;
    number = Number(number);

    const result = await UserLookupHistory.aggregate([
      // Join sang bảng users để lấy email
      {
        $lookup: {
          from: "users",               // tên collection MongoDB (viết thường, số nhiều)
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }, // bóc tách user từ mảng

      // Thêm trường thời gian định dạng theo giờ VN
      {
        $addFields: {
          lookup_at_formatted: {
            $dateToString: {
              format: "%d-%m-%Y | %H:%M:%S",
              date: "$lookup_at",
              timezone: "Asia/Ho_Chi_Minh"
            }
          }
        }
      },
      { $sort: { lookup_at: -1 } }, // sắp xếp mới nhất
      { $limit: number },
      // Chọn các trường cần hiển thị
      {
        $project: {
          _id: 0,
          word: 1,
          meaning: 1,
          isTranslateEnglish: 1,
          lookup_at_formatted: 1,
          email: "$user.email"
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
