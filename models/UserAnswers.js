const mongoose = require("mongoose");

const UserAnswerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Users",
      required: true,
    },
    selected_answer: {
      type: Number,
      required: true,
    },
    correct_answer: {
      type: Number,
      required: true,
    },
    is_wrong: {
      type: Boolean,
      default: false
    },
    answered_at: {
      type: Date,
      default: Date.now,
    },
    question_number: {
      type: Number,
      required: true,
    },
    question_id: {
      type: String,
      required: true,
    },
    group_question_id: {
      type: String,
      required: true,
    },
    part_id: {
      type: Number,
      required: true,
    },
    test_id: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false, // Không cần createdAt, updatedAt vì đã có answered_at
  }
);

module.exports = mongoose.model("User_Answers", UserAnswerSchema);
