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
          activeAlerts,
          totalPosts,
          totalProducts,
          totalRevenue,
          systemHealth: 'Online & Standby Mode',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private / Admin
exports.getAllUsers = async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    } else {
      const users = mockStore.users.map(({ passwordHash, ...rest }) => rest);
      return res.json({ success: true, count: users.length, data: users });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id/role
// @access  Private / Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (isDBConnected()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      await user.save();
      return res.json({ success: true, message: `Role updated to ${role}`, data: user });
    } else {
      const user = mockStore.users.find((u) => u._id.toString() === id.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      const { passwordHash, ...rest } = user;
      return res.json({ success: true, message: `Role updated to ${role}`, data: rest });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      await User.findByIdAndDelete(id);
      return res.json({ success: true, message: 'User removed from system' });
    } else {
      mockStore.users = mockStore.users.filter((u) => u._id.toString() !== id.toString());
      return res.json({ success: true, message: 'User removed from system' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
