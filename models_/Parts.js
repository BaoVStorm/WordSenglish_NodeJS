const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
  part_id: {
    type: Number,
    sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
    unique: true,
  },
  title: {
    type: String,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 200,
  }
}, {
  timestamps: true, // Tự động tạo createdAt & updatedAt
});

module.exports = mongoose.model("Parts", partSchema);