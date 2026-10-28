const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  addResponse,
  upvotePost,
  deletePost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

router.post('/:id/responses', protect, addResponse);
router.post('/:id/upvote', protect, upvotePost);

module.exports = router;
