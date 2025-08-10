const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId },
  admin_name: { type: String },
  action_type: { type: String, enum: ['add', 'edit', 'delete', 'login'], required: true },
  target_type: { type: String, required: true }, // e.g. vocab, topic, test
  target_id: { type: String },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdminLog", adminLogSchema);
