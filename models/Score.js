const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',  // Liên kết tới bảng User
    required: true
  },
  test_id: {
    type: Number,
    required: true
  },
  max_score: {
    type: Number,
    required: true
  },
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Score', scoreSchema);
