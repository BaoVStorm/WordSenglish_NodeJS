// models/UserLookupHistory.js
const mongoose = require('mongoose');

const userLookupHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  vocab_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // <-- Cho phép null
  },
  word: {
    type: String,
    required: true // <-- Bắt buộc nhập
  },
  meaning: {
    type: String,
    required: true // <-- Bắt buộc nhập
  }, 
  isTranslateEnglish: {
    type: Boolean,
    required: true // <-- Bắt buộc nhập
  },
  lookup_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User_Lookup_History', userLookupHistorySchema);
