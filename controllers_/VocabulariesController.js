const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const Vocabulary = require('../models/Vocabularies');
const VocabLevel = require('../models/VocabLevels');
const VocabTopic = require('../models/VocabTopics');
const UserStar = require('../models/UserStars');

// ------------- function

// exports.getListWords = async (req, res) => {
//   try {
//     const {user_id} = req.body;

//     if (!user_id) {
//       return res.status(400).json({
//         msg: "user_id is required"
//       });
//     }

//     const objectId_user = new mongoose.Types.ObjectId(user_id);

//     const vocabularies = await Vocabulary.find().sort({topic_id: 1, level_id: 1});

//     return res.status(200).json({
//       msg: "vocabularies is listed successfully",
//       vocabularies
//     });

//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

exports.getListWords = async (req, res) => {
  try {
    const { user_id, topic_id, level_id} = req.body;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    // 1. Lấy tất cả vocab_id mà user đã star
    let userStarred = null;

    if(topic_id && level_id)
      userStarred = await UserStar.find({ user_id: objectId_user, topic_id: Number(topic_id), level_id: Number(level_id)}, "vocab_id");
    else
      userStarred = await UserStar.find({ user_id: objectId_user }, "vocab_id");

    const starredVocabIds = new Set(
      userStarred
        .filter(item => item.vocab_id)  // Bỏ qua các bản ghi thiếu vocab_id
        .map(item => item.vocab_id.toString())
    );

    // 2. Lấy danh sách từ vựng
    let vocabularies = null;

    if(topic_id && level_id)
      vocabularies = await Vocabulary.find({topic_id: Number(topic_id), level_id: Number(level_id)}).sort({ word: 1 });
    else
      vocabularies = await Vocabulary.find().sort({ topic_id: 1, level_id: 1 });

    // 3. Gán isStar cho từng từ
    const result = vocabularies.map(vocab => {
      const vocabObj = vocab.toObject(); // Chuyển sang object để có thể thêm field mới
      vocabObj.isStar = starredVocabIds.has(vocab._id.toString());
      return vocabObj;
    });

    return res.status(200).json({
      msg: "vocabularies listed successfully",
      vocabularies: result
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getVocabularyByTopicAndLevel = async (req, res) => {
  try {
    const { topic_id, level_id } = req.query;

    // Kiểm tra bắt buộc
    if (!topic_id || !level_id) {
      return res.status(400).json({ msg: "Cần cung cấp topic_id và level_id" });
    }

    // Truy vấn vocabularies
    let vocabularies = await Vocabulary.find({
      topic_id: Number(topic_id),
      level_id: Number(level_id)
    }).sort({ word: 1 }); // Sắp xếp theo tên từ

    if(vocabularies.length == 0)
      vocabularies = await Vocabulary.find({}).sort({ topic_id: 1, level_id: 1 }).limit(30);

    return res.status(200).json({
      msg: "Danh sách từ vựng đã được lấy thành công",
      vocabularies
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getDetailWord = async (req, res) => {
  try {
    const {word_id} = req.body;

    if (!word_id) {
      return res.status(400).json({
        msg: "word_id is required"
      });
    }

    const objectId_word = new mongoose.Types.ObjectId(word_id);

    const vocabularies = await Vocabulary.findById(objectId_word);

    return res.status(200).json(
      vocabularies
    );

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getListVocabLevels = async (req, res) => {
  try {
    const vocabLevels = await VocabLevel.find().sort({level_id: 1});

    return res.status(200).json({
      msg: "vocabLevels is gotten successfully",
      vocabLevels
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getListVocabTopics = async (req, res) => {
  try {
    const vocabTopics = await VocabTopic.find().sort({topic_id: 1});

    return res.status(200).json({
      msg: "vocabTopics is gotten successfully",
      vocabTopics
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// admin

exports.addVocabTopic = async (req, res) => {
  try {
    const { topic_name } = req.body;

    // Tìm topic_id lớn nhất hiện có
    const lastTopic = await VocabTopic.findOne().sort({ topic_id: -1 }).limit(1);
    const newTopicId = lastTopic ? lastTopic.topic_id + 1 : 1;

    // Kiểm tra trùng tên (tuỳ chọn nếu bạn muốn unique theo tên)
    const existing = await VocabTopic.findOne({ topic_name });
    if (existing) {
      return res.status(400).json({ msg: `Chủ đề "${topic_name}" đã tồn tại.` });
    }

    // Thêm mới
    const newTopic = new VocabTopic({
      topic_id: newTopicId,
      topic_name
    });

    await newTopic.save();

    return res.status(201).json({
      msg: "Thêm chủ đề thành công!",
      topic: newTopic
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addVocabLevel = async (req, res) => {
  try {
    const { level_name } = req.body;

    // Tìm level_id lớn nhất hiện có
    const lastLevel = await VocabLevel.findOne().sort({ level_id: -1 }).limit(1);
    const newLevelId = lastLevel ? lastLevel.level_id + 1 : 1;

    // Kiểm tra trùng tên mức độ (tuỳ chọn nếu cần)
    const existing = await VocabLevel.findOne({ level_name });
    if (existing) {
      return res.status(400).json({ msg: `Mức độ "${level_name}" đã tồn tại.` });
    }

    // Tạo và lưu mới
    const newLevel = new VocabLevel({
      level_id: newLevelId,
      level_name
    });

    await newLevel.save();

    return res.status(201).json({
      msg: "Thêm mức độ thành công!",
      level: newLevel
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addVocabulary = async (req, res) => {
  try {
    const {
      word,
      type,
      pronunciation,
      meaning_vietnamese,
      meaning_english,
      example_vietnamese,
      example_english,
      image_url,
      audio_url,
      topic_id,
      level_id
    } = req.body;

    // Kiểm tra bắt buộc
    if (!word || !type) {
      return res.status(400).json({ msg: "Thiếu từ vựng hoặc loại từ (word, type)" });
    }

    // Kiểm tra từ đã tồn tại
    const exists = await Vocabulary.findOne({ word: word.trim().toLowerCase(), type });
    if (exists) {
      return res.status(409).json({ msg: "Từ vựng này đã tồn tại trong hệ thống!" });
    }

    const newVocab = new Vocabulary({
      word: word.trim().toLowerCase(),
      type,
      pronunciation,
      meaning_vietnamese,
      meaning_english,
      example_vietnamese,
      example_english,
      image_url,
      audio_url,
      topic_id,
      level_id
    });

    await newVocab.save();

    return res.status(200).json({ msg: "Thêm từ vựng thành công", vocab: newVocab });

  } catch (err) {
    console.error("Error adding vocab:", err.message);
    return res.status(500).json({ msg: "Lỗi server khi thêm từ vựng" });
  }
};

exports.updateVocabulary = async (req, res) => {
  try {
    const {
      vocab_id,
      word,
      type,
      pronunciation,
      meaning_vietnamese,
      meaning_english,
      example_vietnamese,
      example_english,
      image_url,
      audio_url,
      topic_id,
      level_id
    } = req.body;

    if (!vocab_id) {
      return res.status(400).json({ msg: "Missing vocab_id" });
    }

    const objectId_vocab = new mongoose.Types.ObjectId(vocab_id);

    const updatedVocab = await Vocabulary.findByIdAndUpdate(
      objectId_vocab,
      {
        word,
        type,
        pronunciation,
        meaning_vietnamese,
        meaning_english,
        example_vietnamese,
        example_english,
        image_url,
        audio_url,
        topic_id,
        level_id
      },
      { new: true } // Trả về bản ghi đã cập nhật
    );

    if (!updatedVocab) {
      return res.status(404).json({ msg: "Vocabulary not found" });
    }

    return res.status(200).json({
      msg: "Vocabulary updated successfully",
      vocabulary: updatedVocab
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


exports.deleteVocabulary = async (req, res) => {
  try {
    const { vocab_id } = req.body;

    if (!vocab_id) {
      return res.status(400).json({ msg: "Missing vocab_id" });
    }

    const deletedVocab = await Vocabulary.findByIdAndDelete(vocab_id);

    if (!deletedVocab) {
      return res.status(404).json({ msg: "Vocabulary not found" });
    }

    return res.status(200).json({
      msg: `Vocabulary '${deletedVocab.word}' deleted successfully.`,
      deletedVocab
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};