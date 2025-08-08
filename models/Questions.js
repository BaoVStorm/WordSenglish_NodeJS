const mongoose = require("mongoose");

const QuestionsSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
      sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
      unique: true,
    },
    group_question_id: {
        type: String
    },
    question_text: {
        type: String
    },
    correct_answer: {
        type: Number
    },
    ans_1: {
        type: String
    },
    ans_2: {
        type: String
    },
    ans_3: {
        type: String
    },
    ans_4: {
        type: String
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Questions", QuestionsSchema);