import mongoose from 'mongoose';
import Comment from '../models/comment.js';

export const getCommentsByPost = async (req, res) => {
    try {
        const { post_id } = req.query;
        const comments = await Comment.find({ post_id })
            .populate('user_id', 'user_name') // populate from User model
            .sort({ created_at: -1 });

        // Transform so you directly return username instead of nested user_id object
        const formattedComments = comments.map((comment) => ({
            _id: comment._id,
            user: comment.user_id,
            content: comment.content,
            created_at: comment.created_at,
        }));

        res.json(formattedComments);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { post_id, content } = req.body;
        const user_id = req.user.id;

        // 1. Create comment
        let newComment = await Comment.create({ post_id, user_id, content });

        // 2. Populate user data
        newComment = await newComment.populate('user_id', 'user_name avatar');

        // 3. Format the response
        const formattedComment = {
            _id: newComment._id,
            user: newComment.user_id,
            content: newComment.content,
            created_at: newComment.created_at,
        };

        res.json(formattedComment);
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
