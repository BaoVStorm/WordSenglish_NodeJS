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
        const newComment = await Comment.create({ post_id, user_id, content });
        res.json(newComment);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};