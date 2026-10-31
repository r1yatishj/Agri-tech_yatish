import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Users,
  Trees,
  Sprout,
  Package,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  Megaphone,
  Radio,
  FileCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Alert Form
  const [broadcastForm, setBroadcastForm] = useState({
    district: 'Northern Agricultural Belt',
    state: 'Punjab & Haryana',
    pestName: 'Locust Swarm / Severe Blight Warning',
    riskLevel: 'Severe',
    affectedCrops: 'Wheat, Mustard, Vegetables',
    symptoms: 'Sudden foliage defoliation and dense insect clouds.',
    preventionAdvice: 'Coordinate with local block agriculture office for immediate aerial/drone spray.',
    organicTreatment: 'Bio-deterrent neem formulations',
    chemicalTreatment: 'Chlorpyrifos 20% EC or Malathion 50% EC'
  });

  const [broadcastSent, setBroadcastSent] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/orders'),
        axios.get('/api/admin/users')
      ]);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by Central Operations Admin`
      });
      loadAdminData();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location: {
          district: broadcastForm.district,
          state: broadcastForm.state
        },
        currentWeather: {
          temperature: 30,
          humidity: 72,
          condition: 'High Humidity Threat'
        },
        pestAlert: {
          riskLevel: broadcastForm.riskLevel,
          pestName: broadcastForm.pestName,
          affectedCrops: broadcastForm.affectedCrops.split(',').map(s => s.trim()),
          symptoms: broadcastForm.symptoms,
          preventionAdvice: broadcastForm.preventionAdvice,
          recommendedTreatment: {
            organic: broadcastForm.organicTreatment,
            chemical: broadcastForm.chemicalTreatment
          }
        }
      };
      await axios.post('/api/admin/broadcast-alert', payload);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 5000);
      loadAdminData();
    } catch (err) {
      alert('Failed to broadcast alert: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-danger mb-1 d-flex align-items-center gap-2">
          <ShieldAlert size={28} /> {t('adminDashboardTitle')}
        </h3>
        <p className="text-muted small mb-0">{t('adminSubtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Aggregating platform telemetry...</div>
      ) : (
        <div>
          {/* Executive Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="card-custom p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="metric-label">Farmers Registered</span>
                  <Users size={18} className="text-success" />
                </div>
                <div className="metric-value">{stats?.totalFarmers || 0}</div>
                <small className="text-muted">{stats?.totalUsers || 0} total accounts</small>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card-custom p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="metric-label">{t('totalRevenue')}</span>
                  <IndianRupee size={18} className="text-primary" />
                </div>
                <div className="metric-value text-success">₹{stats?.totalRevenue || 0}</div>
                <small className="text-muted">{stats?.totalOrders || 0} total orders</small>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card-custom p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="metric-label">{t('pendingOrdersCount')}</span>
                  <Package size={18} className="text-warning" />
                </div>
                <div className="metric-value text-warning">{stats?.pendingOrders || 0}</div>
                <small className="text-muted">Awaiting warehouse dispatch</small>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="card-custom p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="metric-label">{t('pendingConsults')}</span>
                  <Clock size={18} className="text-danger" />
                </div>
                <div className="metric-value text-danger">{stats?.pendingConsultations || 0}</div>
                <small className="text-muted">Requires scientist diagnosis</small>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Orders Management Table */}
            <div className="col-lg-8">
              <div className="card-custom p-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Package size={20} className="text-success" /> {t('orderManagement')} ({orders.length})
                  </h5>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle small">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Farmer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id}>
                          <td>
                            <strong>#{ord._id.slice(-6).toUpperCase()}</strong>
                            <small className="d-block text-muted">{new Date(ord.createdAt).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <strong>{ord.farmerName}</strong>
                            <small className="d-block text-muted">{ord.shippingAddress?.district}, {ord.shippingAddress?.state}</small>
                          </td>
                          <td>
                            {ord.items?.map((it, i) => (
                              <div key={i}>{it.quantity}x {it.name}</div>
                            ))}
                          </td>
                          <td className="fw-bold text-success">₹{ord.totalAmount}</td>
                          <td>
                            <span className={`badge ${
                              ord.orderStatus === 'Delivered' ? 'bg-success' :
                              ord.orderStatus === 'Dispatched' ? 'bg-info text-dark' :
                              ord.orderStatus === 'Approved' ? 'bg-primary' : 'bg-warning text-dark'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              {ord.orderStatus === 'Pending Approval' && (
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'Approved')}
                                >
                                  Approve
                                </button>
                              )}
                              {ord.orderStatus === 'Approved' && (
                                <button
                                  className="btn btn-outline-info text-dark"
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'Dispatched')}
                                >
                                  Dispatch
                                </button>
                              )}
                              {ord.orderStatus === 'Dispatched' && (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                                >
                                  Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Emergency Advisory Broadcast Form */}
            <div className="col-lg-4">
              <div className="card-custom p-4 bg-white h-100 border-danger">
                <div className="d-flex align-items-center gap-2 text-danger mb-2">
                  <Megaphone size={20} />
                  <h5 className="fw-bold mb-0">{t('broadcastAdvisory')}</h5>
                </div>
                <p className="small text-muted mb-3">
                  Broadcasts emergency alerts directly onto farmers' dashboards and weather radars in real time.
                </p>

                {broadcastSent && (
                  <div className="alert alert-success small py-2 mb-3">
                    ✓ Emergency advisory dispatched successfully to all farmers!
                  </div>
                )}

                <form onSubmit={handleBroadcastAlert}>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">{t('alertTopic')} *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={broadcastForm.pestName}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, pestName: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Region</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={broadcastForm.district}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, district: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">{t('severity')}</label>
                      <select
                        className="form-select form-select-sm"
                        value={broadcastForm.riskLevel}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, riskLevel: e.target.value })}
                      >
                        <option value="Severe">Severe</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold">Affected Crops *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={broadcastForm.affectedCrops}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, affectedCrops: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold">Observed Symptoms *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      required
                      value={broadcastForm.symptoms}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, symptoms: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Agronomic Prevention Advice *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      required
                      value={broadcastForm.preventionAdvice}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, preventionAdvice: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-danger w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <Radio size={16} /> {t('sendBroadcast')}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* User Directory */}
          <div className="card-custom p-4 bg-white">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Users size={20} className="text-success" /> Registered Farmer Directory ({users.length})
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="d-flex align-items-center gap-2">
                        <img src={u.avatar || 'https://via.placeholder.com/32'} alt="Avatar" className="rounded-circle" width="28" height="28" />
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>{u.location?.district ? `${u.location.district}, ${u.location.state}` : 'N/A'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
