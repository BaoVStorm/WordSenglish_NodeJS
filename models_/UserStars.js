const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStarsSchema = new Schema({
  word: {
    type: String,
  },
  meaning: {
    type: String
  },
  type_star: {
    type: String,
    enum: ['translate', 'vocabulary', 'create'],
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  starred_at: {
    type: Date,
    default: Date.now
  },

  isTranslateEnglish: {
    type: Boolean
  },

  user_lookup_id: {
    type: Schema.Types.ObjectId,
    ref: 'User_Lookup_History'
  },

  vocab_id: {
    type: Schema.Types.ObjectId,
    ref: 'Vocabularies'
  },
  type: {
    type: String
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
  }
});

module.exports = mongoose.model('User_Stars', userStarsSchema);
