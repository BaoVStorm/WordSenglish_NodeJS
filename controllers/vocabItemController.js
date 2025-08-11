import mongoose from 'mongoose';
import VocabItem from '../models/VocabItem.js';
import Post from '../models/Posts.js';
import Love from '../models/Love.js';

export const getVocabItemsByPost = async (req, res) => {
    try {
        const { post_id } = req.query;
        const userId = req.user?.id; // from auth middleware

        // 1. Check if post_id is provided
        if (!post_id) {
            return res.status(400).json({ msg: 'post_id is required' });
        }

        // 2. Validate post_id format
        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            return res.status(400).json({ msg: 'Invalid post_id format' });
        }

        // 3. Get post info (and check existence)
        const post = await Post.findById(post_id).populate('author_id', 'user_name');
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Convert to plain object
        const postData = post.toObject();

        // Add username fallback
        postData.username = postData.author_id?.user_name || 'ADMIN';

        // 4. Count total loves
        const loveCount = await Love.countDocuments({ post_id, islove: true });
        postData.loveCount = loveCount;

        // 5. Check if current user loves this post
        let userLove = false;
        if (userId) {
            const loveDoc = await Love.findOne({ post_id, user_id: userId, islove: true });
            userLove = !!loveDoc;
        }
        postData.love = userLove;

        // 6. Get vocab items for that post
        const vocabItems = await VocabItem.find({ post_id }).sort({ word_en: 1 });

        // 7. Send combined response
        res.json({
            post: postData,
            vocabItems
        });
    } catch (err) {
        console.error('Error fetching vocab items:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
