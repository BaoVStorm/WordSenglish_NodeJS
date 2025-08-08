const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

// init table
const UserStar = require('../models/UserStars');
const Vocabulary = require('../models/Vocabularies');
const UserLookupHistory = require('../models/UserLookupHistory');


// ------------- function

exports.getWordUserStars = async (req, res) => {
  try {
    const {user_id} = req.body;

    if (!user_id) {
      return res.status(400).json({
        msg: "user_id is required"
      });
    }

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    const userStars = await UserStar.find({user_id: objectId_user}).sort({type: 1, starred_at: -1});

    const listUserLookupHistory_VietNamTime = userStars.map(item => {
      const itemObject = item.toObject();
      itemObject.starred_at_vietnam = moment(item.starred_at)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY | HH:mm:ss");
      
      return itemObject;
    });

    return res.status(200).json({
      msg: "userStars are listed successfully",
      userStars: listUserLookupHistory_VietNamTime
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addWordUserStars = async (req, res) => {
  try {
    const {user_id, word, meaning, type_star, vocab_id, user_lookup_id, isTranslateEnglish} = req.body;

    if (!user_id || !type_star) {
      return res.status(400).json({
        msg: "user_id or type_star is required"
      });
    }

    if(!["translate", "vocabulary", "create"].includes(type_star))
      return res.status(400).json({
        msg: "type must be in ['translate', 'vocabulary', 'create']"
      });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    let data = {
      user_id: objectId_user,
      type_star
    };

    if (vocab_id) {
      const ObjectId_vocab = new mongoose.Types.ObjectId(vocab_id);

      const vocab = await Vocabulary.findById(ObjectId_vocab);
    
      if(!vocab)
        return res.status(400).json({
          msg: "vocab_id is not valid"
        });

      data.vocab_id = ObjectId_vocab;

      if (vocab.word) 
        data.word = vocab.word; 

      if(vocab.type)
        data.type = vocab.type;

      if(vocab.pronunciation)
        data.pronunciation = vocab.pronunciation;

      if(vocab.meaning_vietnamese)
        data.meaning_vietnamese = vocab.meaning_vietnamese;
      
      if(vocab.meaning_english)
        data.meaning_english = vocab.meaning_english;
      
      if(vocab.example_vietnamese)
        data.example_vietnamese = vocab.example_vietnamese;
      
      if(vocab.example_english)
        data.example_english = vocab.example_english;
      
      if(vocab.image_url)
        data.image_url = vocab.image_url;
      
      if(vocab.audio_url)
        data.audio_url = vocab.audio_url;
    }
    if (word) {
      data.word = word;
    }
    if (meaning) {
      data.meaning = meaning;
    }
    if (isTranslateEnglish) {
      data.isTranslateEnglish = isTranslateEnglish;
    }

    if(user_lookup_id) {
      const ObjectId_UserLookup = new mongoose.Types.ObjectId(user_lookup_id);

      const userLookupHistory = await UserLookupHistory.findById(ObjectId_UserLookup);

      if(!userLookupHistory)
        return res.status(400).json({
          msg: "user_lookup_id is not valid"
        });

      data.user_lookup_id = ObjectId_UserLookup;
    }

    const newUserStars = new UserStar(data);
    const createdUserStars = await newUserStars.save();

    const itemObject = createdUserStars.toObject();
    itemObject.starred_at_vietnam = moment(createdUserStars.starred_at)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY | HH:mm:ss");

    return res.status(200).json({
      msg: "userStars are created successfully",
      userStars: itemObject
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.removeWordUserStarsById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        msg: "id is required"
      });
    }

    const objectId_userStars = new mongoose.Types.ObjectId(id);

    const deletedUserStar = await UserStar.findByIdAndDelete(objectId_userStars);

    if (!deletedUserStar) {
      return res.status(404).json({
        msg: "UserStar not found or already deleted"
      });
    }

    return res.status(200).json({
      msg: "UserStar deleted successfully",
      deletedUserStar
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.removeWordUserStars = async (req, res) => {
  try {
    const {user_id, type_star, user_lookup_id, vocab_id} = req.body;

    if (!user_id || !type_star) {
      return res.status(400).json({
        msg: "user_id or type_star is required"
      });
    }

    if(!["translate", "vocabulary", "create"].includes(type_star))
      return res.status(400).json({
        msg: "type must be in ['translate', 'vocabulary', 'create']"
      });

    const objectId_user = new mongoose.Types.ObjectId(user_id);

    let deleteCondition = {
      user_id: objectId_user,
      type_star: type_star
    };

    if(type_star == "translate") {

      if(!user_lookup_id)
        return res.status(400).json({
          msg: "with translate, user_lookup_id is required"
        });

      const ObjectId_UserLookup = new mongoose.Types.ObjectId(user_lookup_id);

      deleteCondition.user_lookup_id = ObjectId_UserLookup;
    }
    else
    if(type_star == "vocabulary") {

      if(!vocab_id)
        return res.status(400).json({
          msg: "with vocabulary, vocab_id is required"
        });

      const ObjectId_Vocab = new mongoose.Types.ObjectId(vocab_id);

      deleteCondition.vocab_id = ObjectId_Vocab;
    }
    else {
      // deleteCondition.no = "aaa";
    }

    const result = await UserStar.deleteMany(deleteCondition);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        msg: "No matching star records found"
      });
    }

    return res.status(200).json({
      msg: "userStars removed successfully",
      deletedCount: result.deletedCount
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getUserStarCount = async (req, res) => {
  try {
    userStarCount = await UserStar.countDocuments();
    res.json(userStarCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getUserStarCountByWeek = async (req, res) => {
  try {
    const result = await UserStar.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$starred_at" }, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
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
