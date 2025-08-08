// models/UserLookupHistory.js
const mongoose = require('mongoose');

const VocabTopicSchema = new mongoose.Schema({
  topic_id: {
    type: Number,
  },
  topic_name: {
    type: String,
  }
}, {
  timestamps: true // thêm createdAt và updatedAt
});

module.exports = mongoose.model('vocab_topics', VocabTopicSchema);