import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Trees,
  Wheat,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Send,
  X,
  Layers,
} from 'lucide-react';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'alerts', 'orders', 'products'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [alertForm, setAlertForm] = useState({
    region: 'North-Western Agro-Climatic Zone',
    temperature: 32,
    humidity: 80,
    rainfall: 10,
    windSpeed: 15,
    pestRiskLevel: 'High',
    advisoryMessage: '',
    identifiedThreat: 'Stem Borer & Powdery Mildew',
    recommendedAction: '',
    affectedCrops: 'Basmati Rice, Cotton',
    severity: 'Warning',
  });
  const [alertSuccess, setAlertSuccess] = useState('');

  // New product form
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Seeds',
    price: '',
    unit: '1 Unit',
    description: '',
    stock: 50,
    badge: 'Verified',
  });
  const [productSuccess, setProductSuccess] = useState('');

  const fetchAdminData = async () => {
    try {
      const [sRes, uRes, oRes, aRes, pRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: null } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } })),
        api.get('/orders').catch(() => ({ data: { data: [] } })),
        api.get('/weather/alerts').catch(() => ({ data: { data: [] } })),
        api.get('/products').catch(() => ({ data: { data: [] } })),
      ]);

      setStats(sRes.data.data);
      setUsers(uRes.data.data || []);
      setOrders(oRes.data.data || []);
      setAlerts(aRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'farmer' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete user failed');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/weather/alerts', alertForm);
      setAlertSuccess('Weather and pest warning broadcasted successfully to all farmers!');
      setAlertForm({
        region: 'North-Western Agro-Climatic Zone',
        temperature: 32,
        humidity: 80,
        rainfall: 10,
        windSpeed: 15,
        pestRiskLevel: 'High',
        advisoryMessage: '',
        identifiedThreat: 'Stem Borer & Powdery Mildew',
        recommendedAction: '',
        affectedCrops: 'Basmati Rice, Cotton',
        severity: 'Warning',
      });
      setTimeout(() => setAlertSuccess(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/weather/alerts/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', productForm);
      setProductSuccess('Product listed in Kisan marketplace!');
      setProductForm({
        name: '',
        category: 'Seeds',
        price: '',
        unit: '1 Unit',
        description: '',
        stock: 50,
        badge: 'Verified',
      });
      setTimeout(() => setProductSuccess(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from marketplace?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Administrator Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 text-xs font-bold text-purple-300 border border-purple-500/40">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Administrator & Agronomist Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Agri-Tech Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            System metrics, user moderation, order fulfillment, and regional alert broadcasting
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>System Status: {stats?.systemHealth || 'Operational & Healthy'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'Platform Metrics & Health', icon: Layers },
          { id: 'users', label: `User Management (${users.length})`, icon: Users },
          { id: 'orders', label: `Order Dispatch (${orders.length})`, icon: ShoppingBag },
          { id: 'alerts', label: `Weather & Pest Broadcaster (${alerts.length})`, icon: AlertTriangle },
          { id: 'products', label: `Marketplace Catalog (${products.length})`, icon: Wheat },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
              <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || users.length}</p>
              <p className="text-[11px] text-purple-600 font-semibold">
                {stats?.totalFarmers || 1} Farmers • {stats?.totalAdmins || 1} Admins
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Farms Monitored</span>
              <p className="text-3xl font-extrabold text-slate-900">{stats?.totalFarms || 2}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {stats?.totalCrops || 3} Active Crop Cycles
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Marketplace Revenue</span>
              <p className="text-3xl font-extrabold text-emerald-700">₹{stats?.totalRevenue || 2190}</p>
              <p className="text-[11px] text-slate-500 font-semibold">
                {stats?.totalOrders || orders.length} Total Orders Fulfilled
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Risk Alerts</span>
              <p className="text-3xl font-extrabold text-amber-600">{stats?.activeAlerts || alerts.length}</p>
              <p className="text-[11px] text-amber-700 font-semibold">
                {stats?.totalPosts || 2} Community Discussions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Registered Farmers & Staff Accounts</h3>
            <span className="text-xs text-slate-400">Total: {users.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Name & Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Phone & Location</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 font-medium">{u.phone || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{u.location || 'Rural Region'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRoleToggle(u._id || u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Switch to {u.role === 'admin' ? 'Farmer' : 'Admin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u._id || u.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Oversight */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Marketplace Order Fulfillment & Status</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Order ID & Date</th>
                  <th className="px-5 py-3.5">Farmer & Destination</th>
                  <th className="px-5 py-3.5">Items Summary</th>
                  <th className="px-5 py-3.5">Total (₹)</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-800">{o._id}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{o.farmerName}</p>
                      <p className="text-[11px] text-slate-400">
                        {o.shippingAddress?.villageOrCity}, {o.shippingAddress?.state}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {o.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">₹{o.totalAmount}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Weather & Pest Broadcaster */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Broadcast Emergency Pest / Climate Advisory
            </h3>

            {alertSuccess && (
              <p className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{alertSuccess}</span>
              </p>
            )}

            <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Agro-Climatic Zone</label>
                <input
                  type="text"
                  required
                  value={alertForm.region}
                  onChange={(e) => setAlertForm({ ...alertForm, region: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Identified Threat</label>
                  <input
                    type="text"
                    required
                    value={alertForm.identifiedThreat}
                    onChange={(e) => setAlertForm({ ...alertForm, identifiedThreat: e.target.value })}
                    placeholder="e.g. Late Blight, Whitefly"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Risk Level</label>
                  <select
                    value={alertForm.pestRiskLevel}
                    onChange={(e) => setAlertForm({ ...alertForm, pestRiskLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Environmental Trigger</label>
                <textarea
                  rows="2"
                  required
                  value={alertForm.advisoryMessage}
                  onChange={(e) => setAlertForm({ ...alertForm, advisoryMessage: e.target.value })}
                  placeholder="e.g. Night relative humidity exceeding 85% with fog creates high sporulation risk..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommended Agronomic Action</label>
                <textarea
                  rows="2"
                  required
                  value={alertForm.recommendedAction}
                  onChange={(e) => setAlertForm({ ...alertForm, recommendedAction: e.target.value })}
                  placeholder="e.g. Spray Mancozeb 75 WP @ 2g/L or Trichoderma viride within 36 hours..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Affected Crops</label>
                <input
                  type="text"
                  value={alertForm.affectedCrops}
                  onChange={(e) => setAlertForm({ ...alertForm, affectedCrops: e.target.value })}
                  placeholder="e.g. Basmati Rice, Mustard, Cotton"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Broadcast Urgent Advisory to Farmers
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Active Broadcasted Advisories</h3>
            {alerts.map((al) => (
              <div
                key={al._id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{al.identifiedThreat}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteAlert(al._id)}
                    className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                  >
                    Dismiss Alert
                  </button>
                </div>
                <p className="text-slate-600">{al.advisoryMessage}</p>
                <p className="text-emerald-700 font-semibold">{al.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Products Catalog Admin */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">List New Agriculture Input Item</h3>

            {productSuccess && (
              <p className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {productSuccess}
              </p>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Certified Shriram Wheat Seeds"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Bio-Fertilizers">Bio-Fertilizers</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Irrigation & Tools">Irrigation & Tools</option>
                    <option value="Soil Amendments">Soil Amendments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 750"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Packaging</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="e.g. 20 kg bag"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. High Yield"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detail specification, germination percentage, and application guidelines..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Add Product to Marketplace
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Active Marketplace Products</h3>
            <div className="space-y-2">
              {products.map((pr) => (
                <div
                  key={pr._id}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{pr.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {pr.category} • {pr.unit} • ₹{pr.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(pr._id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
