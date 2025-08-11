import Post from '../models/Posts.js';
import VocabItem from '../models/VocabItem.js';
import Love from '../models/Love.js';

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
        const userId = req.user.id; // from auth middleware
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        const total = await Post.countDocuments();

        let posts = await Post.find()
            .populate('author_id', 'user_name')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const postIds = posts.map(p => p._id);

        // Fetch loves for current user only
        const loves = await Love.find({
            post_id: { $in: postIds },
            user_id: userId,
            islove: true
        }).lean();

        // Turn into lookup { postId: true }
        const loveMap = loves.reduce((acc, l) => {
            acc[l.post_id.toString()] = true;
            return acc;
        }, {});

        // Merge username fallback + love boolean
        posts = posts.map(post => ({
            ...post,
            username: post.author_id?.user_name || 'ADMIN',
            love: !!loveMap[post._id.toString()] // true if user liked it
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
