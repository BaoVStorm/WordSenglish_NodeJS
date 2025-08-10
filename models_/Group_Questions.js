const mongoose = require("mongoose");

const GQSchema = new mongoose.Schema(
  {
    group_question_id: {
      type: String,
      sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
      unique: true,
    },
    test_id: {
        type: Number,
    },
    part_id: {
        type: Number,
    },
    url_image1: {
        type: String,
    },
    url_image2: {
        type: String,
    },
    url_image3: {
        type: String,
    },
    url_image4: {
        type: String,
    },
    url_image5: {
        type: String,
    },
    url_audio: {
        type: String,
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Group_Questions", GQSchema);