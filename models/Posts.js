import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Posts', postSchema);
