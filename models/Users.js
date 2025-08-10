const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
      unique: true,
    },
    password_hash: {
      type: String,
      maxlength: 255,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Users", userSchema);
