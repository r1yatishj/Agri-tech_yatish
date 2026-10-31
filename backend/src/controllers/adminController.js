const mongoose = require('mongoose');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const WeatherAlert = require('../models/WeatherAlert');
const ForumPost = require('../models/ForumPost');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get aggregated platform statistics for Admin dashboard
// @route   GET /api/admin/stats
// @access  Private / Admin
exports.getDashboardStats = async (req, res) => {
  try {
    if (isDBConnected()) {
      const [
        totalUsers,
        totalFarmers,
        totalAdmins,
        totalFarms,
        totalCrops,
        totalOrders,
        pendingOrders,
        activeAlerts,
        totalPosts,
        totalProducts,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'farmer' }),
        User.countDocuments({ role: 'admin' }),
        Farm.countDocuments(),
        Crop.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['Placed', 'Processing', 'Processing & Packed'] } }),
        WeatherAlert.countDocuments({ isActive: true }),
        ForumPost.countDocuments(),
        Product.countDocuments(),
      ]);

      const orders = await Order.find({ status: { $ne: 'Cancelled' } });
      const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalFarmers,
          totalAdmins,
          totalFarms,
          totalCrops,
          totalOrders,
          pendingOrders,
          pendingConsultations: (mockStore.consultations || []).filter(c => c.status !== 'Resolved').length,
          activeAlerts,
          totalPosts,
          totalProducts,
          totalRevenue,
          systemHealth: 'Online & Optimal',
        },
      });
    } else {
      const totalUsers = mockStore.users.length;
      const totalFarmers = mockStore.users.filter((u) => u.role === 'farmer').length;
      const totalAdmins = mockStore.users.filter((u) => u.role === 'admin').length;
      const totalFarms = mockStore.farms.length;
      const totalCrops = mockStore.crops.length;
      const totalOrders = mockStore.orders.length;
      const pendingOrders = mockStore.orders.filter((o) => ['Placed', 'Processing'].includes(o.status)).length;
      const pendingConsultations = (mockStore.consultations || []).filter(c => c.status !== 'Resolved').length;
      const activeAlerts = mockStore.weatherAlerts.filter((a) => a.isActive !== false).length;
      const totalPosts = mockStore.forumPosts.length;
      const totalProducts = mockStore.products.length;
      const totalRevenue = mockStore.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalFarmers,
          totalAdmins,
          totalFarms,
          totalCrops,
          totalOrders,
          pendingOrders,
          pendingConsultations,
          activeAlerts,
          totalPosts,
          totalProducts,
          totalRevenue,
          systemHealth: 'Online & Optimal (In-Memory Microclimate Active)',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Broadcast pest or weather alert across network
// @route   POST /api/admin/broadcast-alert
// @access  Private / Admin
exports.broadcastAlert = async (req, res) => {
  try {
    const { alert, district, state, pestName, riskLevel, affectedCrops, symptoms, preventionAdvice, recommendedTreatment } = req.body;

    const data = alert || req.body;

    const newPestAlert = {
      alertActive: true,
      riskLevel: data.riskLevel || 'High',
      pestName: data.pestName || 'Urgent Agronomic Advisory',
      scientificName: data.pestName || 'Pathogen Outbreak',
      affectedCrops: Array.isArray(data.affectedCrops) ? data.affectedCrops : (data.affectedCrops || '').split(',').map(s => s.trim()).filter(Boolean),
      symptoms: data.symptoms || 'Visual lesion patterns and wilting',
      preventionAdvice: data.preventionAdvice || 'Immediate mitigation recommended',
      recommendedTreatment: data.recommendedTreatment || {
        organic: data.organicTreatment || 'Neem oil botanical spray 1500 ppm',
        chemical: data.chemicalTreatment || 'Targeted agrochemical spray as advised'
      }
    };

    mockStore.activePestAlert = newPestAlert;

    const alertLog = {
      _id: 'alert_' + Date.now(),
      region: `${data.district || 'Northern Belt'}, ${data.state || 'Agricultural Network'}`,
      temperature: 32,
      humidity: 78,
      windSpeed: 14,
      pestRiskLevel: data.riskLevel || 'High',
      advisoryMessage: data.symptoms || 'Agronomic alert broadcasted by Department Specialist',
      identifiedThreat: data.pestName || 'Pest & Pathogen Surveillance',
      recommendedAction: data.preventionAdvice || 'Implement protective measures immediately.',
      affectedCrops: newPestAlert.affectedCrops,
      severity: data.riskLevel === 'Severe' ? 'Critical' : 'Warning',
      isActive: true,
      createdAt: new Date(),
    };

    if (isDBConnected()) {
      await WeatherAlert.create(alertLog);
    } else {
      mockStore.weatherAlerts.unshift(alertLog);
    }

    return res.status(201).json({
      success: true,
      message: 'Agricultural alert broadcasted live across all farmer dashboards',
      data: newPestAlert
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private / Admin
exports.getAllUsers = async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    } else {
      const users = mockStore.users.map(({ passwordHash, ...u }) => u);
      return res.json({ success: true, count: users.length, data: users });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user role (admin/farmer)
// @route   PUT /api/admin/users/:id/role
// @access  Private / Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be farmer or admin' });
    }

    if (isDBConnected()) {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      await user.save();
      return res.json({ success: true, message: `Role updated to ${role}`, data: user });
    } else {
      const user = mockStore.users.find((u) => u._id.toString() === id.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      const { passwordHash, ...cleanUser } = user;
      return res.json({ success: true, message: `Role updated to ${role}`, data: cleanUser });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    if (isDBConnected()) {
      await User.findByIdAndDelete(id);
      return res.json({ success: true, message: 'User deleted' });
    } else {
      mockStore.users = mockStore.users.filter((u) => u._id.toString() !== id.toString());
      return res.json({ success: true, message: 'User deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
