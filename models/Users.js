const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     user_name: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     full_name: {
//       type: String,
//       required: true,
//       maxlength: 100
//     },
//     email: {
//       type: String,
//       unique: true,
//       sparse: true,
//       maxlength: 100
//     },
//     phone_number: {
//       type: String,
//       maxlength: 15
//     },
//     password_hash: {
//       type: String,
//       required: true,
//       maxlength: 255
//     },
//     date_of_birth: {
//       type: Date
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       maxlength: 6
//     }
//   },
//   {
//     timestamps: true // Tự động tạo createdAt & updatedAt
//   }
// );

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      sparse: true,  // Cho phép giá trị null (sử dụng cho Google Login)
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Cho phép giá trị null (sử dụng cho Google Login)
      maxlength: 100,
    },
    phone_number: {
      type: String,
      maxlength: 15,
    },
    password_hash: {
      type: String,
      maxlength: 255,
    },
    date_of_birth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      maxlength: 6,
    },
    google_id: {
      type: String,   // Dành cho đăng nhập Google
      unique: true,
      sparse: true,   // Cho phép giá trị này null
    },
    provider: {
      type: String,   // Lưu phương thức đăng nhập (ví dụ: 'local', 'google')
      enum: ['local', 'google'],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    photo_url: {
      type: String,   // Lưu URL ảnh đại diện của Google (nếu có)
    },
    token: {
      type: String,
    } ,
    verified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

module.exports = mongoose.model("Users", userSchema);
