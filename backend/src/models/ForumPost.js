const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      enum: ['farmer', 'admin', 'expert'],
      default: 'farmer',
    },
    title: {
      type: String,
      required: [true, 'Please provide question title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide question or post content'],
    },
    category: {
      type: String,
      enum: [
        'Crop Diseases',
        'Soil & Fertilizers',
        'Pest Control',
        'Government Schemes',
        'Market Rates',
        'General Agriculture',
      ],
      default: 'General Agriculture',
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isResolved: {
      type: Boolean,
      default: false,
    },
    hasExpertResponse: {
      type: Boolean,
      default: false,
    },
    responses: [
      {
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: { type: String, required: true },
        authorRole: { type: String, default: 'farmer' },
        comment: { type: String, required: true },
        isExpertAnswer: { type: Boolean, default: false },
        upvotes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);
