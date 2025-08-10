const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

//
const UserAnswer = require('../models/UserAnswers');
const Test = require('../models/Tests');

// Get Current User

exports.getWrongAnswers = async (req, res, next) => {
    try {
        const { user_id, part_id } = req.body;
        const objectId_user = new mongoose.Types.ObjectId(user_id);

        let user_answers;

        if(part_id) {
            user_answers = await UserAnswer.find({
                is_wrong: true,
                user_id: objectId_user,
                part_id: part_id
            }).sort({ test_id: 1, question_number: 1 });
        }
        else {
            user_answers = await UserAnswer.find({
                is_wrong: true,
                user_id: objectId_user
            }).sort({ test_id: 1, question_number: 1 });
        }

        // Lấy danh sách test_id duy nhất (kiểu số)
        const testIds = [...new Set(user_answers.map(ans => ans.test_id))];

        // Tìm các bài test theo cột test_id (không phải _id)
        const tests = await Test.find(
            { test_id: { $in: testIds } },
            { test_id: 1, title: 1 }
        );

        // Tạo map từ test_id → title
        const testMap = {};
        tests.forEach(test => {
            testMap[test.test_id] = test.title;
        });

        // Gắn title cho mỗi answer
        const listUser_answers_VietNamTime = user_answers.map(item => {
            const itemObject = item.toObject();
            itemObject.starred_at_vietnam = moment(item.starred_at)
                .tz("Asia/Ho_Chi_Minh")
                .format("DD/MM/YYYY | HH:mm:ss");

            itemObject.test_title = testMap[item.test_id] || "";

            return itemObject;
        });

        res.status(200).json({
            msg: "get user answers wrong successfully",
            user_answers: listUser_answers_VietNamTime
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
};

exports.getWrongPercent = async (req, res, next) => {
    try {
        const result = await UserAnswer.aggregate([
            {
                $group: {
                _id: null,
                total: { $sum: 1 },
                wrong: {
                    $sum: {
                    $cond: [{ $eq: ["$is_wrong", true] }, 1, 0]
                    }
                }
                }
            },
            {
                $project: {
                _id: 0,
                total: 1,
                wrong: 1,
                wrongPercentage: {
                    $cond: [
                    { $eq: ["$total", 0] },
                    0,
                    { $multiply: [{ $divide: ["$wrong", "$total"] }, 100] }
                    ]
                }
                }
            }
            ]);

            if(result.length > 0)
                return res.status(200).json(result[0].wrongPercentage.toFixed(2));

            return res.status(200).json(0);

    }  catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
}

exports.getCorrectPercent = async (req, res, next) => {
    try {
        const result = await UserAnswer.aggregate([
            {
                $group: {
                _id: null,
                total: { $sum: 1 },
                wrong: {
                    $sum: {
                    $cond: [{ $eq: ["$is_wrong", true] }, 1, 0]
                    }
                }
                }
            },
            {
                $project: {
                _id: 0,
                total: 1,
                wrong: 1,
                wrongPercentage: {
                    $cond: [
                    { $eq: ["$total", 0] },
                    0,
                    { $multiply: [{ $divide: ["$wrong", "$total"] }, 100] }
                    ]
                }
                }
            }
            ]);

            if(result.length > 0)
                return res.status(200).json((100 - result[0].wrongPercentage).toFixed(2));

            return res.status(200).json(0);

    }  catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
}