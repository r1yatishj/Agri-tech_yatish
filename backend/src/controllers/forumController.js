const mongoose = require('mongoose');
const ForumPost = require('../models/ForumPost');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all forum discussion posts
// @route   GET /api/forum
// @access  Public / Private
exports.getPosts = async (req, res) => {
  try {
    const { category, search } = req.query;

    if (isDBConnected()) {
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      const posts = await ForumPost.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: posts.length, data: posts });
    } else {
      let posts = mockStore.forumPosts;
      if (category && category !== 'All') {
        posts = posts.filter((p) => p.category === category || p.category.includes(category) || category.includes(p.category));
      }
      if (search) {
        const s = search.toLowerCase();
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.content.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, count: posts.length, data: posts });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single forum post by ID
// @route   GET /api/forum/:id
// @access  Public / Private
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Question not found' });
      return res.json({ success: true, data: post });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Question not found' });
      return res.json({ success: true, data: post });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new question / discussion thread
// @route   POST /api/forum
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Question title and detailed inquiry content are required',
      });
    }

    if (isDBConnected()) {
      const post = await ForumPost.create({
        authorId: req.user._id,
        authorName: req.user.name,
        authorRole: req.user.role || 'farmer',
        title,
        content,
        category: category || 'General Farming',
        upvotes: 0,
        upvotedBy: [],
        isResolved: false,
        hasExpertResponse: false,
        responses: [],
      });

      return res.status(201).json({
        success: true,
        message: 'Question posted to Agri-Tech Community Forum',
        data: post,
      });
    } else {
      const newPost = {
        _id: 'post_' + Date.now(),
        authorId: req.user._id,
        authorName: req.user.name,
        authorRole: req.user.role || 'farmer',
        title,
        content,
        category: category || 'General Farming',
        upvotes: 0,
        upvotedBy: [],
        isResolved: false,
        hasExpertResponse: false,
        responses: [],
        createdAt: new Date(),
      };

      mockStore.forumPosts.unshift(newPost);
      return res.status(201).json({
        success: true,
        message: 'Question posted to Agri-Tech Community Forum',
        data: newPost,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add answer / expert reply to a question
// @route   POST /api/forum/:id/reply and POST /api/forum/:id/responses
// @access  Private
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, content, isExpertAnswer } = req.body;

    const replyText = content || comment;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const isExpert = isExpertAnswer || req.user.role === 'admin';

    const newResponse = {
      _id: 'resp_' + Date.now(),
      authorId: req.user._id,
      authorName: req.user.name + (isExpert ? ' (Agronomist Expert)' : ''),
      authorRole: req.user.role,
      comment: replyText,
      content: replyText,
      isExpertAnswer: isExpert,
      upvotes: 0,
      createdAt: new Date(),
    };

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });

      post.responses.push(newResponse);
      if (isExpert) {
        post.hasExpertResponse = true;
      }
      await post.save();

      return res.status(201).json({
        success: true,
        message: 'Reply posted to forum discussion',
        data: post,
      });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });

      if (!post.responses) post.responses = [];
      post.responses.push(newResponse);
      if (isExpert) {
        post.hasExpertResponse = true;
      }

      return res.status(201).json({
        success: true,
        message: 'Reply posted to forum discussion',
        data: post,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote a forum post
// @route   POST /api/forum/:id/upvote
// @access  Private
exports.upvotePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      post.upvotes = (post.upvotes || 0) + 1;
      await post.save();

      return res.json({
        success: true,
        data: post,
      });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      post.upvotes = (post.upvotes || 0) + 1;

      return res.json({
        success: true,
        data: post,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/forum/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete' });
      }

      await ForumPost.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Post deleted' });
    } else {
      const index = mockStore.forumPosts.findIndex((p) => p._id.toString() === id.toString());
      if (index === -1) return res.status(404).json({ success: false, message: 'Post not found' });

      mockStore.forumPosts.splice(index, 1);
      return res.json({ success: true, message: 'Post deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
