const mongoose = require('mongoose');
const Order = require('../models/Order');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const STAGES = [
  'Order Placed',
  'Confirmed & Packed',
  'In Transit / Shipped',
  'Out for Delivery',
  'Delivered',
];

const generateTimeline = (currentStatus) => {
  const stageMap = {
    Placed: 0,
    Confirmed: 1,
    Shipped: 2,
    'Out for Delivery': 3,
    Delivered: 4,
    Cancelled: -1,
  };

  const currentIdx = stageMap[currentStatus] !== undefined ? stageMap[currentStatus] : 0;

  return STAGES.map((stage, idx) => ({
    stage,
    timestamp: idx <= currentIdx ? new Date() : null,
    completed: idx <= currentIdx,
    detail:
      idx === 0
        ? 'Order placed successfully by farmer'
        : idx === 1
        ? 'Seeds & supplies quality checked and dispatched'
        : idx === 2
        ? 'Consignment en route to local agricultural distribution hub'
        : idx === 3
        ? 'Field delivery agent dispatched for doorstep delivery'
        : 'Delivered to farm / verified receipt',
  }));
};

// @desc    Create new marketplace order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.villageOrCity ||
      !shippingAddress.state ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address and contact number are required',
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const timeline = generateTimeline('Placed');

    if (isDBConnected()) {
      const order = await Order.create({
        farmerId: req.user._id,
        farmerName: req.user.name,
        items,
        totalAmount,
        status: 'Placed',
        shippingAddress: {
          fullName: shippingAddress.fullName || req.user.name,
          street: shippingAddress.street,
          villageOrCity: shippingAddress.villageOrCity,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode || '302001',
          phone: shippingAddress.phone || req.user.phone || '+91 99999 99999',
        },
        trackingTimeline: timeline,
        paymentMethod: paymentMethod || 'Kisan Credit Card / Cash On Delivery',
        paymentStatus: 'COD Verified',
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! Delivery tracking initiated.',
        data: order,
      });
    } else {
      const newOrder = {
        _id: 'order_' + Date.now(),
        farmerId: req.user._id,
        farmerName: req.user.name,
        items,
        totalAmount,
        status: 'Placed',
        shippingAddress: {
          fullName: shippingAddress.fullName || req.user.name,
          street: shippingAddress.street,
          villageOrCity: shippingAddress.villageOrCity,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode || '302001',
          phone: shippingAddress.phone || req.user.phone || '+91 99999 99999',
        },
        trackingTimeline: timeline,
        paymentMethod: paymentMethod || 'Kisan Credit Card / Cash On Delivery',
        paymentStatus: 'COD Verified',
        createdAt: new Date(),
      };

      mockStore.orders.unshift(newOrder);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! Delivery tracking initiated.',
        data: newOrder,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for logged in farmer
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    if (isDBConnected()) {
      const orders = await Order.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    } else {
      const orders = mockStore.orders.filter(
        (o) => o.farmerId.toString() === req.user._id.toString()
      );
      return res.json({ success: true, count: orders.length, data: orders });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (req.user.role !== 'admin' && order.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this order' });
      }

      return res.json({ success: true, data: order });
    } else {
      const order = mockStore.orders.find((o) => o._id.toString() === id.toString());
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (req.user.role !== 'admin' && order.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this order' });
      }

      return res.json({ success: true, data: order });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private / Admin
exports.getAllOrders = async (req, res) => {
  try {
    if (isDBConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    } else {
      return res.json({ success: true, count: mockStore.orders.length, data: mockStore.orders });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status & tracking (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private / Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status option' });
    }

    const updatedTimeline = generateTimeline(status);

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.trackingTimeline = updatedTimeline;
      if (status === 'Delivered') {
        order.paymentStatus = 'Completed';
      }

      await order.save();
      return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    } else {
      const order = mockStore.orders.find((o) => o._id.toString() === id.toString());
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.trackingTimeline = updatedTimeline;
      if (status === 'Delivered') {
        order.paymentStatus = 'Completed';
      }

      return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
