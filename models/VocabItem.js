import mongoose from 'mongoose';

const vocabItemSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
    word_en: { type: String, required: true },
    meaning_vi: { type: String, required: true },
    example: { type: String },
    spelling: { type: String },
    pronunciation: { type: String },
});

export default mongoose.model('VocabItem', vocabItemSchema);
