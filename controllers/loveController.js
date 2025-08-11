import mongoose from 'mongoose';
import Love from '../models/Love.js';
import Post from '../models/Posts.js';

export const toggleLove = async (req, res) => {
    try {
        const { post_id } = req.body;
        const user_id = req.user.id; // assuming you get user ID from JWT middleware

        // 1. Validate post_id
        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            return res.status(400).json({ msg: 'Invalid post_id format' });
        }

        // 2. Check if post exists
        const postExists = await Post.findById(post_id);
        if (!postExists) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // 3. Find existing love
        let love = await Love.findOne({ post_id, user_id });

        if (love) {
            // Toggle islove
            love.islove = !love.islove;
            await love.save();
            return res.json({ msg: love.islove ? 'Post loved' : 'Post unloved', islove: love.islove });
        }

        // 4. If not exists, create new love
        love = new Love({ post_id, user_id, islove: true });
        await love.save();

        res.json({ msg: 'Post loved', islove: true });
    } catch (err) {
        console.error('Error toggling love:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
