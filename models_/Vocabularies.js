// models/UserLookupHistory.js
const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  pronunciation: {
    type: String
  },
  meaning_vietnamese: {
    type: String 
  },
  meaning_english: {
    type: String
  },
  example_vietnamese: {
    type: String
  },
  example_english: {
    type: String
  },
  image_url: {
    type: String
  },
  audio_url: {
    type: String
  },
  topic_id: {
    type: Number,
  },
  level_id: {
    type: Number,
  }
}, {
  timestamps: true // thêm createdAt và updatedAt
});

module.exports = mongoose.model('Vocabularies', VocabularySchema);