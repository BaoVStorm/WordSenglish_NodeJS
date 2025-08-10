// models/UserLookupHistory.js
const mongoose = require('mongoose');

const VocabLevelsSchema = new mongoose.Schema({
  level_id: {
    type: Number,
  },
  level_name: {
    type: String,
  }
}, {
  timestamps: true // thêm createdAt và updatedAt
});

module.exports = mongoose.model('vocab_levels', VocabLevelsSchema);