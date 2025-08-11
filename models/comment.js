import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', CommentSchema);
