const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// init table
const Tests = require('../models/Tests');
const Parts = require('../models/Parts');
const Group_Questions = require('../models/Group_Questions');
const Questions = require('../models/Questions');

// ------------- function

// lấy danh sách các test đang có trong database
exports.getListTest = async (req, res) => {
  try {
    const {is_full_test} = req.query;

    let test;

    if(is_full_test == "true")
      test = await Tests.find({is_full_test: true}).sort({test_id: 1}); 
    else
    if(is_full_test == "false")
      test = await Tests.find({is_full_test: false}).sort({test_id: 1}); 
    else
      test = await Tests.find().sort({test_id: 1});

    if(!test)
      res.status(400).json({ message: "This test is not exist!" });

    res.json(test);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy thông tin test
exports.getTest = async (req, res) => {
  try {
    const {test_id} = req.query;

    if(!test_id)
      res.status(400).json({ message: "need test_id to get Test Detail !" });

    const test = await Tests.findOne({test_id: test_id}); 

    if(!test)
      res.status(400).json({ message: "This test is not exist!" });

    res.json(test);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy thông tin part
exports.getPart = async (req, res) => {
  try {
    const {part_id} = req.query;

    if(!part_id)
      res.status(400).json({ message: "need part_id to get Part Detail !" });

    const part = await Parts.findOne({part_id: part_id}); 

    if(!part)
      res.status(400).json({ message: "this part is not exist!" });

    res.json(part);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy danh sách các part
exports.getListPart = async (req, res) => {
  try {
    const list_parts = await Parts.find().sort({part_id: 1}); 

    if(!list_parts)
      res.status(400).json({ message: "This part is not exist!"});

    res.json(list_parts);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy danh sách thông tin cụ thể của test (nhiều nhóm câu hỏi)
exports.getListGroupQuestion = async (req, res) => {
  try {
    const {test_id} = req.query;

    if(!test_id)
      res.status(400).json({ message: "need test_id to get list group questions !" });

    // const list_groupQuestions = await Group_Questions.find({test_id: test_id}).sort({ group_question_id: 1 }); 
    const list_groupQuestions = await Group_Questions.aggregate([
      {
        $match: { test_id: Number(test_id) } // hoặc test_id biến nếu bạn truyền từ ngoài
      },
      {
        $addFields: {
          sort_number: {
            $toInt: {
              $arrayElemAt: [
                { $split: ["$group_question_id", "_"] },
                2 // lấy phần tử thứ 3 sau split "_"
              ]
            }
          }
        }
      },
      {
        $sort: { part_id: 1, sort_number: 1 }
      }
    ]);

    
    if(!list_groupQuestions || list_groupQuestions.length === 0)
      res.status(400).json({ message: `no groupQuestion is belong to test_id: ${test_id}`});

    // Duyệt từng group question để lấy thông tin bổ sung
    const enhancedGroupQuestions = await Promise.all(
      list_groupQuestions.map(async (group) => {
        const questions = await Questions.find({ group_question_id: group.group_question_id }).sort({ question_id: 1 });

        return {
          ...group,
          first_question_id: questions[0]?.question_id || null,
          question_count: questions.length
        };
      })
    );

    res.json(enhancedGroupQuestions);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

  // lấy thông tin cụ thể của 1 nhóm câu hỏi (1 GroupQuestion)
exports.getGroupQuestionDetail = async (req, res) => {
  try {
    const {group_question_id} = req.query;

    if(!group_question_id)
      res.status(400).json({ message: "need group_question_id to get group questions detail !" });

    const groupQuestion = await Group_Questions.findOne({group_question_id: group_question_id}); 

    if(!groupQuestion)
      res.status(400).json({ message: "This groupQuestion is not exist !" });

    res.json(groupQuestion);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy danh sách các câu hỏi thuộc 1 nhóm câu hỏi (list Questions in Group_Question)
exports.getListQuestion = async (req, res) => {
  try {
    const {group_question_id} = req.query;

    if(!group_question_id)
      res.status(400).json({ message: "need group_question_id to get list questions !" });
    
    // const list_Questions = await Questions.find({group_question_id: group_question_id}).sort({question_id: 1}); 
    const list_Questions = await Questions.aggregate([
      {
        $match: { group_question_id: group_question_id }
      },
      {
        $addFields: {
          sort_number: {
            $toInt: {
              $arrayElemAt: [
                {
                  $getField: {
                    field: "captures",
                    input: {
                      $regexFind: {
                        input: "$question_id",
                        regex: /(\d+)$/
                      }
                    }
                  }
                },
                0
              ]
            }
          }
        }
      },
      {
        $sort: { sort_number: 1 }
      }
    ]);
    
    if(!list_Questions)
      res.status(400).json({ message: `no Questions is belong to group_question_id: ${group_question_id}`});

    res.json(list_Questions);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

  // lấy thông tin cụ thể của 1 câu hỏi (1 Question)
exports.getQuestionDetail = async (req, res) => {
  try {
    const {question_id} = req.query;

    if(!question_id)
      res.status(400).json({ message: "need question_id to get question detail !" });

    const Question = await Questions.findOne({question_id: question_id}); 

    if(!Question)
      res.status(400).json({ message: "This Question is not exist !" });

    res.json(Question);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

// lấy tất cả câu hỏi của 1 test
exports.getListQuestionByTestId = async (req, res) => {
  try {
    const { test_id } = req.query;

    if (!test_id)
      return res.status(400).json({ message: "need test_id to get list questions!" });

    const list_Questions = await Questions.aggregate([
      {
        // Tách "test1_1" thành ["test1", "1"]
        $addFields: {
          split_id: { $split: ["$question_id", "_"] }
        }
      },
      {
        // Gán test_prefix = "test1", sort_number = 1
        $addFields: {
          test_prefix: { $arrayElemAt: ["$split_id", 0] },
          sort_number: { $toInt: { $arrayElemAt: ["$split_id", 1] } }
        }
      },
      {
        // So sánh phần "test1" với đầu vào
        $match: { test_prefix: "test" + test_id }
      },
      {
        $sort: { sort_number: 1 }
      },
      {
        $project: {
          split_id: 0, // ẩn trường tạm
          test_prefix: 0,
          sort_number: 0
        }
      }
    ]);

    if (!list_Questions || list_Questions.length === 0)
      return res.status(404).json({ message: `No questions found for test_id: ${test_id}` });

    res.json(list_Questions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getTestAttemptCounts = async (req, res) => {
  try {
    const result = await Tests.aggregate([
      {
        $lookup: {
          from: "certificates",          // bảng certificates
          localField: "test_id",         // trường từ bảng tests
          foreignField: "test_id",       // trường trong certificates
          as: "certificates"
        }
      },
      {
        $addFields: {
          attempt_count: { $size: "$certificates" } // đếm số chứng chỉ liên quan
        }
      },
      {
        $project: {
          _id: 1,
          test_id: 1,
          title: 1,
          attempt_count: 1,
          test_time: 1,
          question_number: 1,
          part_number: 1,
          is_full_test: 1
        }
      },
      {
        $sort: { is_full_test: -1, title: 1 } // sắp xếp theo tên bài test
      }
    ]);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// exports.addVocabulary = async (req, res) => {
//   try {
//     const {
//       word,
//       type,
//       pronunciation,
//       meaning_vietnamese,
//       meaning_english,
//       example_vietnamese,
//       example_english,
//       image_url,
//       audio_url,
//       topic_id,
//       level_id
//     } = req.body;

//     // Kiểm tra bắt buộc
//     if (!word || !type) {
//       return res.status(400).json({ msg: "Thiếu từ vựng hoặc loại từ (word, type)" });
//     }

//     // Kiểm tra từ đã tồn tại
//     const exists = await Vocabulary.findOne({ word: word.trim().toLowerCase(), type });
//     if (exists) {
//       return res.status(409).json({ msg: "Từ vựng này đã tồn tại trong hệ thống!" });
//     }

//     const newVocab = new Vocabulary({
//       word: word.trim().toLowerCase(),
//       type,
//       pronunciation,
//       meaning_vietnamese,
//       meaning_english,
//       example_vietnamese,
//       example_english,
//       image_url,
//       audio_url,
//       topic_id,
//       level_id
//     });

//     await newVocab.save();

//     return res.status(200).json({ msg: "Thêm từ vựng thành công", vocab: newVocab });

//   } catch (err) {
//     console.error("Error adding vocab:", err.message);
//     return res.status(500).json({ msg: "Lỗi server khi thêm từ vựng" });
//   }
// };