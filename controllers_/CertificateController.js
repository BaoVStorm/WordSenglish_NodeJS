// init table
const mongoose = require('mongoose');
const Certificate = require('../models/Certificates');
const UserAnswer = require('../models/UserAnswers');
const moment = require("moment-timezone");

// lấy thêm bằng (kết quả thi) của 1 bài test của người dùng
exports.addCertificate = async (req, res) => {
  try {
    const {test_id, 
        user_id, 
        certificate_name,
        reading_score = 0,
        listening_score = 0,
        total_score = 0,
        correct_count = 0,
        wrong_count = 0
    } = req.body;

    if(!test_id || !user_id)
        return res.status(400).json({ msg: "test_id, user_id are required" });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // Certificate.
    const newCertificate = await new Certificate({
        test_id, 
        user_id: objectId_user, 
        certificate_name,
        reading_score,
        listening_score,
        total_score,
        correct_count,
        wrong_count
    });

    const createdCertificate = await newCertificate.save();

    return res.status(201).json({
      msg: "Certificate created successfully",
      certificate: createdCertificate
    });

  } catch(err) {
    console.error("Add certificate error:", err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const { user_id } = req.query; 

    if (!user_id)
      return res.status(400).json({ msg: "user_id is required" });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const certificates = await Certificate.find({ user_id: objectId_user }).sort({ awarded_at: -1 });

    const certificates_VietNamTime = certificates.map(item => {
      const itemObject = item.toObject();
      itemObject.awarded_at_vietnam = moment(item.awarded_at)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY | HH:mm:ss");
      
      return itemObject;
    });

    return res.status(200).json({
      msg: "Certificates fetched successfully",
      certificates: certificates_VietNamTime,
    });
  } catch (err) {
    console.error("Get certificate error:", err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.addUserAnswers = async (req, res) => {
    try {
        const { user_id, test_id, answers } = req.body;

        if (!user_id || !test_id || !Array.isArray(answers)) {
            return res.status(400).json({ msg: "Missing or invalid parameters" });
        }
        
        console.log("Received body:", req.body);

        const objectIdUser = new mongoose.Types.ObjectId(user_id);

        // Xoá toàn bộ câu trả lời cũ của user cho bài test này
        await UserAnswer.deleteMany({
            user_id: objectIdUser,
            test_id: test_id
        });

        const answerDocs = answers.map((ans) => ({
            user_id: objectIdUser,
            test_id: test_id,
            selected_answer: ans.selected_answer,
            correct_answer: ans.correct_answer,
            is_wrong: ans.is_wrong,
            answered_at: new Date(), // hoặc có thể để mặc định
            question_number: ans.question_number,
            question_id: ans.question_id,
            group_question_id: ans.group_question_id,
            part_id: ans.part_id,
        }));

        const insertedAnswers = await UserAnswer.insertMany(answerDocs);

        return res.status(201).json({
            msg: "Answers saved successfully",
            data: insertedAnswers,
        });
    } catch (err) {
        console.error("Error saving answers:", err);
        return res.status(500).json({ msg: "Server error", error: err.message });
    }
};


exports.getCertificateDoneByWeek = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$awarded_at" }, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
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


exports.getTop10LastestCertificates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await Certificate.aggregate([
      // Join với bảng User để lấy email
      {
        $lookup: {
          from: "users", // tên collection (viết thường, số nhiều theo default của Mongo)
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // Tính tỷ lệ hoàn thành và format thời gian
      {
        $addFields: {
          completion_rate: {
            $cond: [
              { $eq: [{ $add: ["$correct_count", "$wrong_count"] }, 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correct_count", { $add: ["$correct_count", "$wrong_count"] }] },
                  100
                ]
              }
            ]
          },
          awarded_at_formatted: {
            $dateToString: {
              format: "%d-%m-%Y | %H:%M",
              date: "$awarded_at",
              timezone: "Asia/Ho_Chi_Minh"
            }
          }
        }
      },

      // Sắp xếp theo thời gian gần nhất
      { $sort: { awarded_at: -1 } },

      // Lấy 10 bản ghi gần nhất
      { $limit: limit },

      // Chỉ lấy các trường cần thiết
      {
        $project: {
          _id: 0,
          test_id: 1,
          certificate_name: 1,
          email: "$user.email",
          correct_count: 1,
          wrong_count: 1,
          completion_rate: { $round: ["$completion_rate", 2] },
          awarded_at: "$awarded_at_formatted"
        }
      }
    ]);

    // console.log("Top 10 certificates gần nhất:");
    // console.table(result); 
    return res.status(200).json(result);

  } catch (err) {
    console.error("Error saving answers:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};


exports.getCertificateCount = async (req, res) => {
  try {
    const certificateCount = await Certificate.countDocuments();
    res.json(certificateCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getTestPassRate = async (req, res) => {
  try {
    const totalCount = await Certificate.countDocuments();
    const passedCount = await Certificate.countDocuments({
      $expr: { $gte: ["$correct_count", "$wrong_count"] }
    });

    const passRate = totalCount === 0 ? 0 : (passedCount / totalCount) * 100;

    return res.status(200).json(passRate.toFixed(2));

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getMostFailedTest = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      {
        $match: {
          $expr: { $lt: ["$correct_count", "$wrong_count"] }
        }
      },
      {
        $group: {
          _id: "$certificate_name",
          failed_count: { $sum: 1 }
        }
      },
      {
        $sort: { failed_count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ msg: "No failed tests found" });
    }

    return res.status(200).json({
      msg: "Most failed test retrieved successfully",
      certificate_name: result[0]._id,
      failed_count: result[0].failed_count
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getTopUsersByTotalScore = async (req, res) => {
  try {
    let { number } = req.query;
    if (!number) number = 10;
    number = Number(number);

    const result = await Certificate.aggregate([
      {
        $group: {
          _id: "$user_id",
          total_score: { $sum: "$total_score" }
        }
      },
      {
        $lookup: {
          from: "users", // tên collection gốc
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user_id: "$_id",
          full_name: "$user.full_name",
          email: "$user.email",
          total_score: 1
        }
      },
      { $sort: { total_score: -1 } },
      { $limit: number }
    ]);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getTestCorrectPercentage = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      {
        $project: {
          test_id: 1,
          certificate_name: 1,
          correct_count: 1,
          wrong_count: 1,
          total_count: { $add: ["$correct_count", "$wrong_count"] },
          percentage: {
            $cond: {
              if: { $eq: [{ $add: ["$correct_count", "$wrong_count"] }, 0] },
              then: 0,
              else: { $multiply: [{ $divide: ["$correct_count", { $add: ["$correct_count", "$wrong_count"] }] }, 100] }
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 20, 40, 60, 80, 100],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Tạo các nhóm điểm mặc định (nếu không có kết quả cho nhóm)
    const bucketData = [
      { _id: 0, count: 0 },
      { _id: 20, count: 0 },
      { _id: 40, count: 0 },
      { _id: 60, count: 0 },
      { _id: 80, count: 0 },
    ];

    // Gộp kết quả từ MongoDB vào nhóm mặc định
    result.forEach(item => {
      const index = bucketData.findIndex(bucket => bucket._id === item._id);
      if (index >= 0) {
        bucketData[index].count = item.count;
      }
    });

    // Trả về chỉ mảng các count
    const counts = bucketData.map(item => item.count);

    return res.status(200).json(counts);

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getTestCountsByFullTest = async (req, res) => {
  try {
    const result = await Certificate.aggregate([
      // Liên kết với bảng `Test` dựa trên `test_id` từ cả hai bảng
      {
        $lookup: {
          from: "tests",  // Tên collection trong MongoDB
          localField: "test_id",  // Trường test_id trong bảng Certificate
          foreignField: "test_id", // Trường test_id trong bảng Test
          as: "test_info"
        }
      },

      // Đếm số lượng FullTest (is_full_test: true) và MiniTest (is_full_test: false)
      {
        $addFields: {
          fulltest_count: {
            $size: {
              $filter: {
                input: "$test_info",  // Lọc trong test_info
                as: "certificate",
                cond: { $eq: ["$$certificate.is_full_test", true] }
              }
            }
          },
          minitest_count: {
            $size: {
              $filter: {
                input: "$test_info",
                as: "certificate",
                cond: { $eq: ["$$certificate.is_full_test", false] }
              }
            }
          }
        }
      },

      // Chỉ lấy thông tin cần thiết (test_id, tên bài kiểm tra, và số lượng FullTest/MiniTest)
      {
        $project: {
          _id: 0,
          test_id: 1,
          test_name: "$test_info.title", // Nếu bạn muốn hiển thị tên bài kiểm tra từ bảng Test
          is_full_test: "$fulltest_count",
          not_is_full_test: "$minitest_count"
        }
      },

      // Sắp xếp theo tên bài kiểm tra (test_name)
      { $sort: { test_name: 1 } }
    ]);

    // Tính tổng số lượng FullTest và MiniTest
    let totalFullTest = 0;
    let totalMiniTest = 0;

    result.forEach(item => {
      totalFullTest += item.is_full_test;
      totalMiniTest += item.not_is_full_test;
    });

    return res.status(200).json({
      is_full_test: totalFullTest,
      not_is_full_test: totalMiniTest,
      total: totalFullTest + totalMiniTest
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};