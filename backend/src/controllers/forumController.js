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
        posts = posts.filter((p) => p.category === category);
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

// @desc    Get single forum post with answers
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
        category: category || 'General Agriculture',
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
        category: category || 'General Agriculture',
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
// @route   POST /api/forum/:id/responses
// @access  Private
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Response comment cannot be empty' });
    }

    const isExpert = req.user.role === 'admin';

    const newResponse = {
      authorId: req.user._id,
      authorName: req.user.name + (isExpert ? ' (Agronomist Expert)' : ''),
      authorRole: req.user.role,
      comment,
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
        message: 'Your reply has been submitted',
        data: post,
      });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Discussion post not found' });

      newResponse._id = 'resp_' + Date.now();
      post.responses.push(newResponse);
      if (isExpert) {
        post.hasExpertResponse = true;
      }

      return res.status(201).json({
        success: true,
        message: 'Your reply has been submitted',
        data: post,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote a post
// @route   POST /api/forum/:id/upvote
// @access  Private
exports.upvotePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const hasUpvoted = post.upvotedBy.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

      if (hasUpvoted) {
        post.upvotes = Math.max(0, post.upvotes - 1);
        post.upvotedBy = post.upvotedBy.filter(
          (userId) => userId.toString() !== req.user._id.toString()
        );
      } else {
        post.upvotes += 1;
        post.upvotedBy.push(req.user._id);
      }

      await post.save();
      return res.json({ success: true, upvotes: post.upvotes });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      const uid = req.user._id.toString();
      const idx = post.upvotedBy.indexOf(uid);
      if (idx !== -1) {
        post.upvotes = Math.max(0, post.upvotes - 1);
        post.upvotedBy.splice(idx, 1);
      } else {
        post.upvotes += 1;
        post.upvotedBy.push(uid);
      }

      return res.json({ success: true, upvotes: post.upvotes });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete / Moderate forum post (Admin or Author)
// @route   DELETE /api/forum/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const post = await ForumPost.findById(id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
      }

      await ForumPost.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Discussion post removed' });
    } else {
      const post = mockStore.forumPosts.find((p) => p._id.toString() === id.toString());
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

      if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
      }

      mockStore.forumPosts = mockStore.forumPosts.filter((p) => p._id.toString() !== id.toString());
      return res.json({ success: true, message: 'Discussion post removed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
