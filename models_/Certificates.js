const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    test_id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // nếu bạn có model Users
      required: true
    },
    certificate_name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    reading_score: {
      type: Number,
      default: 0,
    },
    listening_score: {
      type: Number,
      default: 0,
    },
    total_score: {
      type: Number,
      default: 0,
    },
    correct_count: {
      type: Number,
      default: 0,
    },
    wrong_count: {
      type: Number,
      default: 0,
    },
    awarded_at: {
      type: Date,
      default: Date.now, // giống như `timestamp default current_timestamp` trong SQL
    },
  },
  {
    timestamps: true, // tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model("Certificates", CertificateSchema);
