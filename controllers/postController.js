import Post from '../models/Posts.js';
import VocabItem from '../models/VocabItem.js';

export const createPostWithVocabs = async (req, res) => {
    try {
        const { title, description, vocab_items } = req.body;
        const userId = req.user.id;

        const post = await Post.create({ title, description, author_id: userId });

        if (Array.isArray(vocab_items) && vocab_items.length > 0) {
            const vocabsToInsert = vocab_items.map(v => ({
                ...v,
                post_id: post._id
            }));
            await VocabItem.insertMany(vocabsToInsert);
        }

        res.status(201).json({
            message: 'Post and vocab items created successfully',
            post_id: post._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        // Read page from query string (default = 1)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 12; // Number of posts per page
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Post.countDocuments();

        // Fetch posts (newest first)
        let posts = await Post.find()
            .populate('author_id', 'user_name') // populate only user_name
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // return plain JS objects so we can modify them easily

        // Add username fallback
        posts = posts.map(post => ({
            ...post,
            username: post.author_id?.user_name || 'ADMIN'
        }));

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};