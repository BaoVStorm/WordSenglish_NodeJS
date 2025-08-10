const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    test_id: {
      type: Number,
      sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
      unique: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    is_full_test: {
      type: Boolean
    },
    part_number: {
        type: Number,
        default: 7
    },
    question_number: {
      type: Number,
      default: 200
    },
    test_time: {
      type: Number,
      default: 120
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Tests", testSchema);