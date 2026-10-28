import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Award,
  Plus,
  Search,
  User,
  ShieldCheck,
  Send,
  X,
  Trash2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  'All',
  'Crop Diseases',
  'Soil & Fertilizers',
  'Pest Control',
  'Government Schemes',
  'Market Rates',
  'General Agriculture',
];

const CommunityForum = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [newPostData, setNewPostData] = useState({
    title: '',
    category: 'Crop Diseases',
    content: '',
  });

  const fetchPosts = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/forum', { params });
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a consultation query');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/forum', newPostData);
      setModalOpen(false);
      setNewPostData({ title: '', category: 'Crop Diseases', content: '' });
      fetchPosts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!isAuthenticated) {
      alert('Please sign in to upvote');
      return;
    }

    try {
      const res = await api.post(`/forum/${postId}/upvote`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, upvotes: res.data.upvotes } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResponse = async (postId) => {
    if (!replyText.trim()) return;
    if (!isAuthenticated) {
      alert('Please sign in to reply');
      return;
    }

    try {
      await api.post(`/forum/${postId}/responses`, { comment: replyText });
      setReplyText('');
      setActiveReplyPostId(null);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this forum discussion?')) return;
    try {
      await api.delete(`/forum/${postId}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-xs font-bold text-emerald-300 border border-emerald-500/40">
            <Award className="w-3.5 h-3.5" />
            <span>Kisan Agronomy Consultation Board</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Farmer Knowledge & Expert Q&A Forum
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Troubleshoot pest attacks, discuss organic bio-fertilizer recipes, compare mandi rates, and receive verified agronomic recommendations from certified agronomists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Agronomist / New Query</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diseases, urea dosage, mustard spacing..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            <span className="font-bold text-slate-900">{posts.length}</span> Active Inquiries
          </span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Thread List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading forum discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Questions Found</h3>
          <p className="text-xs text-slate-500">Be the first to ask our agronomy community a question!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              {/* Top Meta info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {post.authorName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{post.authorName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {post.category}
                  </span>
                  {post.hasExpertResponse && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Expert Verified</span>
                    </span>
                  )}
                  {(isAdmin || user?.id === post.authorId || user?._id === post.authorId) && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post._id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title and Content */}
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Upvote & Action Bar */}
              <div className="flex items-center gap-4 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => handleUpvote(post._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 font-bold transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes || 0} Upvotes</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveReplyPostId(activeReplyPostId === post._id ? null : post._id)
                  }
                  className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.responses?.length || 0} Replies</span>
                </button>
              </div>

              {/* Verified Answers & Discussion Thread */}
              {post.responses && post.responses.length > 0 && (
                <div className="pt-3 space-y-3 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Community & Expert Solutions
                  </h4>

                  <div className="space-y-2.5">
                    {post.responses.map((resp, rIdx) => (
                      <div
                        key={rIdx}
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                          resp.isExpertAnswer
                            ? 'bg-emerald-50/80 border border-emerald-200/90'
                            : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{resp.authorName}</span>
                            {resp.isExpertAnswer && (
                              <span className="px-2 py-0.2 rounded-md bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>Verified Agronomist</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(resp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{resp.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input Box (When expanded) */}
              {activeReplyPostId === post._id && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        isAdmin
                          ? 'Provide verified agronomist diagnosis or advisory...'
                          : 'Share your agricultural advice or experience...'
                      }
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddResponse(post._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Ask a Question to the Agronomist Community
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  placeholder="e.g. Yellow leaf spots on Bt cotton during flowering: Fungus or deficiency?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agricultural Category</label>
                <select
                  value={newPostData.category}
                  onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Field Inquiry & Symptoms
                </label>
                <textarea
                  rows="4"
                  required
                  value={newPostData.content}
                  onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                  placeholder="Provide soil type, irrigation interval, recent fertilizer sprays, and visible symptom details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200"
                >
                  {submitting ? 'Submitting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;
