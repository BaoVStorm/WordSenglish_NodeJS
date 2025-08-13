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

export const editPostWithVocabs = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { title, description, vocab_items } = req.body;
        const userId = req.user.id;

        // Check if the post exists and belongs to the current user
        const post = await Post.findOne({ _id: post_id, author_id: userId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        // Update post details
        post.title = title;
        post.description = description;
        await post.save();

        // Update vocabulary items
        if (Array.isArray(vocab_items)) {
            // First delete existing vocab items of this post
            await VocabItem.deleteMany({ post_id });

            // Then insert the new list
            const vocabsToInsert = vocab_items.map(v => ({
                ...v,
                post_id
            }));
            if (vocabsToInsert.length > 0) {
                await VocabItem.insertMany(vocabsToInsert);
            }
        }

        res.status(200).json({
            message: 'Post and vocab items updated successfully',
            post_id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { post_id } = req.body;
        const userId = req.user.id; // from auth middleware
        const userRole = req.user.role; // if you store role in token/middleware

        // 1. Find the post
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 2. Check if the user is allowed to delete
        if (post.author_id.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // 3. Delete the post
        await Post.findByIdAndDelete(post_id);

        res.status(200).json({ message: 'Post deleted successfully' });
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

export const getUserVocabulary = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        const vocabList = await Post.find({ author_id: userId }).sort({ createdAt: -1 });

        res.status(200).json(vocabList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};