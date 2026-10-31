import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Plus,
  Send,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';

const CommunityForum = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'consultation'
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Post Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'General Farming'
  });

  // Reply Input state
  const [replyTextMap, setReplyTextMap] = useState({});

  // Consultations state
  const [consultations, setConsultations] = useState([]);
  const [consultForm, setConsultForm] = useState({
    cropAffected: '',
    issueSubject: '',
    symptoms: '',
    specializationRequested: 'Agronomist (Soil & Crop)',
    urgency: 'Normal'
  });
  const [showConsultModal, setShowConsultModal] = useState(false);

  const categories = [
    'All',
    'Crop Diseases',
    'Organic Farming',
    'Soil & Water',
    'Government Schemes',
    'Market Trends',
    'General Farming'
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/forum', {
        params: {
          category: selectedCategory,
          search: searchQuery
        }
      });
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const res = await axios.get('/api/consultations');
      setConsultations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'forum') {
      fetchPosts();
    } else {
      fetchConsultations();
    }
  }, [activeTab, selectedCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/forum', postForm);
      setShowPostModal(false);
      setPostForm({ title: '', content: '', category: 'General Farming' });
      fetchPosts();
    } catch (err) {
      alert('Failed to submit post: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await axios.post(`/api/forum/${postId}/upvote`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, upvotes: res.data.data.upvotes } : p
        )
      );
    } catch (err) {
      console.error('Error upvoting post:', err);
    }
  };

  const handleAddReply = async (postId) => {
    const text = replyTextMap[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await axios.post(`/api/forum/${postId}/reply`, {
        content: text,
        isExpertAnswer: user?.role === 'admin'
      });
      setReplyTextMap({ ...replyTextMap, [postId]: '' });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.data : p))
      );
    } catch (err) {
      alert('Failed to send reply: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/consultations', consultForm);
      setShowConsultModal(false);
      setConsultForm({
        cropAffected: '',
        issueSubject: '',
        symptoms: '',
        specializationRequested: 'Agronomist (Soil & Crop)',
        urgency: 'Normal'
      });
      fetchConsultations();
    } catch (err) {
      alert('Failed to request consultation: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-success mb-1">
            {activeTab === 'forum' ? t('communityTitle') : t('expertConsultTitle')}
          </h3>
          <p className="text-muted small mb-0">
            {activeTab === 'forum' ? t('communitySubtitle') : t('expertConsultSubtitle')}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group bg-white rounded-3 shadow-sm p-1">
            <button
              className={`btn btn-sm ${activeTab === 'forum' ? 'btn-success fw-bold' : 'btn-light'}`}
              onClick={() => setActiveTab('forum')}
            >
              <MessageSquare size={16} className="me-1" /> {t('navForum')}
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'consultation' ? 'btn-success fw-bold' : 'btn-light'}`}
              onClick={() => setActiveTab('consultation')}
            >
              <Stethoscope size={16} className="me-1" /> {t('navConsult')}
            </button>
          </div>
          {activeTab === 'forum' ? (
            <button className="btn btn-sm btn-agri d-flex align-items-center gap-1" onClick={() => setShowPostModal(true)}>
              <Plus size={16} /> {t('askQuestion')}
            </button>
          ) : (
            <button className="btn btn-sm btn-agri d-flex align-items-center gap-1" onClick={() => setShowConsultModal(true)}>
              <Plus size={16} /> {t('requestConsult')}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Forum Knowledge Exchange */}
      {activeTab === 'forum' && (
        <div>
          {/* Categories Bar */}
          <div className="card-custom p-3 mb-4 bg-white">
            <div className="d-flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${
                    selectedCategory === cat ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'
                  } rounded-pill px-3`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">Loading farmer discussions...</div>
          ) : posts.length === 0 ? (
            <div className="card-custom p-5 text-center bg-white">
              <MessageSquare size={48} className="text-muted mb-2 opacity-50" />
              <h6>No discussions in this category yet.</h6>
              <button className="btn btn-sm btn-agri mt-2" onClick={() => setShowPostModal(true)}>
                {t('askQuestion')}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {posts.map((post) => (
                <div key={post._id} className="col-12">
                  <div className="card-custom p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-success-subtle text-success me-2">{post.category}</span>
                        <span className="small text-muted">
                          Posted by <strong>{post.authorName}</strong> ({post.authorRole}) • {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        onClick={() => handleUpvote(post._id)}
                      >
                        <ThumbsUp size={14} />
                        <span>{post.upvotes}</span>
                      </button>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{post.title}</h5>
                    <p className="text-secondary mb-3">{post.content}</p>

                    {/* Replies Thread */}
                    {post.replies?.length > 0 && (
                      <div className="p-3 rounded-3 bg-light mb-3">
                        <span className="small fw-bold text-muted d-block mb-2">
                          {post.replies.length} {t('replies')}:
                        </span>
                        {post.replies.map((reply, i) => (
                          <div key={i} className={`p-2 mb-2 rounded-2 ${reply.isExpertAnswer ? 'bg-success-subtle border border-success' : 'bg-white border'}`}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div>
                                <strong className="small text-dark">{reply.authorName}</strong>
                                {reply.isExpertAnswer && (
                                  <span className="badge bg-success ms-2" style={{ fontSize: '0.65rem' }}>
                                    ✓ Verified Extension Scientist
                                  </span>
                                )}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                            <p className="small text-dark mb-0">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Reply Field */}
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Write a helpful answer or observation..."
                        value={replyTextMap[post._id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [post._id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id)}
                      />
                      <button className="btn btn-sm btn-agri" onClick={() => handleAddReply(post._id)}>
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Expert Consultation & Clinical Prescriptions */}
      {activeTab === 'consultation' && (
        <div>
          {consultations.length === 0 ? (
            <div className="card-custom p-5 text-center bg-white">
              <Stethoscope size={48} className="text-muted mb-2 opacity-50" />
              <h6>No active consultation requests found.</h6>
              <p className="text-muted small">Submit your crop symptoms to get diagnosis and prescriptions from our agricultural scientists.</p>
              <button className="btn btn-sm btn-agri mt-2" onClick={() => setShowConsultModal(true)}>
                {t('requestConsult')}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {consultations.map((c) => (
                <div key={c._id} className="col-lg-6">
                  <div className="card-custom p-4 bg-white h-100 border-start border-4 border-success">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className={`badge ${c.urgency.includes('Risk') ? 'bg-danger' : c.urgency === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {c.urgency} Urgency
                        </span>
                        <span className="badge bg-light text-muted border ms-1">{c.specializationRequested}</span>
                      </div>
                      <span className={`badge ${c.status === 'Prescription Provided' ? 'bg-success' : 'bg-primary'}`}>
                        {c.status}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-1">{c.issueSubject}</h5>
                    <p className="small text-muted mb-2">
                      <strong>Crop:</strong> 🌱 {c.cropAffected} • Farmer: {c.farmerName} • {new Date(c.createdAt).toLocaleDateString()}
                    </p>

                    <div className="p-3 bg-light rounded-3 small mb-3">
                      <strong>Reported Symptoms:</strong>
                      <p className="mb-0 text-secondary mt-1">{c.symptoms}</p>
                    </div>

                    {/* Prescription Section if available */}
                    {c.expertPrescription?.diagnosis ? (
                      <div className="p-3 bg-success-subtle border border-success rounded-3 small">
                        <div className="d-flex align-items-center gap-1 text-success fw-bold mb-1">
                          <ShieldCheck size={16} /> {c.assignedExpert?.name || 'ICAR Extension Agronomist'}
                        </div>
                        <p className="mb-1"><strong>Diagnosis:</strong> {c.expertPrescription.diagnosis}</p>
                        <p className="mb-1"><strong>Immediate Action:</strong> {c.expertPrescription.immediateAction}</p>
                        {c.expertPrescription.recommendedInputs?.length > 0 && (
                          <div className="mb-1">
                            <strong>Recommended Inputs: </strong>
                            {c.expertPrescription.recommendedInputs.map((inp, idx) => (
                              <span key={idx} className="badge bg-white text-success border me-1">{inp}</span>
                            ))}
                          </div>
                        )}
                        <p className="mb-0 text-muted fst-italic">Guidelines: {c.expertPrescription.preventiveGuidelines}</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-warning-subtle text-warning-emphasis small rounded-2 text-center">
                        <Clock size={14} className="me-1" /> Case is currently under review by our extension agronomist.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create Forum Post */}
      {showPostModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('askQuestion')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPostModal(false)}></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{t('postCategory')}</label>
                    <select
                      className="form-select"
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{t('postTitle')} *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. How to prevent yellow rust on wheat crop in cold fog?"
                      required
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Detailed Observation / Question *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Describe crop stage, appearance of leaves or soil, pest activity..."
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowPostModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-agri">{t('postSubmit')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Request Expert Consultation */}
      {showConsultModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{t('requestConsult')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowConsultModal(false)}></button>
              </div>
              <form onSubmit={handleCreateConsultation}>
                <div className="modal-body">
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Affected Crop *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('cropNamePlaceholder')}
                        required
                        value={consultForm.cropAffected}
                        onChange={(e) => setConsultForm({ ...consultForm, cropAffected: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Specialist Domain</label>
                      <select
                        className="form-select"
                        value={consultForm.specializationRequested}
                        onChange={(e) => setConsultForm({ ...consultForm, specializationRequested: e.target.value })}
                      >
                        <option value="Agronomist (Soil & Crop)">Agronomist (Soil & Crop)</option>
                        <option value="Entomologist (Pest Control)">Entomologist (Pest Control)</option>
                        <option value="Plant Pathologist">Plant Pathologist</option>
                        <option value="Organic Farming Advisor">Organic Farming Advisor</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Problem Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('subjectPlaceholder')}
                      required
                      value={consultForm.issueSubject}
                      onChange={(e) => setConsultForm({ ...consultForm, issueSubject: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Detailed Symptoms & History *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      placeholder={t('symptomsPlaceholder')}
                      value={consultForm.symptoms}
                      onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">{t('urgency')}</label>
                    <select
                      className="form-select"
                      value={consultForm.urgency}
                      onChange={(e) => setConsultForm({ ...consultForm, urgency: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Emergency / Crop Loss Risk">Emergency / Crop Loss Risk</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowConsultModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-agri">Submit to Agronomist</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;
