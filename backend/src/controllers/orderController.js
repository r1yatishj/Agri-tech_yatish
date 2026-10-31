const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const generateTimeline = (status) => {
  const now = new Date();
  const stages = [
    { stage: 'Order Placed', completed: true, timestamp: now, detail: 'Order booked via Kisan Portal' },
    { stage: 'Processing & Packed', completed: status !== 'Placed', timestamp: status !== 'Placed' ? now : null, detail: 'Warehouse preparation' },
    { stage: 'Shipped / In Transit', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), timestamp: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status) ? now : null, detail: 'Dispatched to rural delivery hub' },
    { stage: 'Out for Delivery', completed: ['Out for Delivery', 'Delivered'].includes(status), timestamp: ['Out for Delivery', 'Delivered'].includes(status) ? now : null, detail: 'Local delivery agent assigned' },
    { stage: 'Delivered', completed: status === 'Delivered', timestamp: status === 'Delivered' ? now : null, detail: 'Handed over to farmer' },
  ];
  return stages;
};

// @desc    Place a new marketplace order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    const calculatedTotal = Number(total) || items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const timeline = generateTimeline('Placed');

    const address = {
      fullName: shippingAddress?.recipientName || shippingAddress?.fullName || req.user.name,
      street: shippingAddress?.village || shippingAddress?.street || 'Main Farm Road',
      villageOrCity: shippingAddress?.district || shippingAddress?.villageOrCity || 'Kota',
      state: shippingAddress?.state || 'Rajasthan',
      pincode: shippingAddress?.pincode || '324001',
      phone: shippingAddress?.phone || req.user.phone || '+91 98234 56789',
    };

    if (isDBConnected()) {
      const order = await Order.create({
        farmerId: req.user._id,
        farmerName: req.user.name,
        items,
        totalAmount: calculatedTotal,
        status: 'Placed',
        shippingAddress: address,
        trackingTimeline: timeline,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        paymentStatus: 'Pending',
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
        totalAmount: calculatedTotal,
        status: 'Placed',
        shippingAddress: address,
        trackingTimeline: timeline,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        paymentStatus: 'Pending',
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

// @desc    Get orders (returns all for admin, user orders for farmer)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    if (isDBConnected()) {
      const query = isAdmin ? {} : { farmerId: req.user._id };
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    } else {
      const orders = isAdmin
        ? mockStore.orders
        : mockStore.orders.filter(
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
      return res.json({ success: true, data: order });
    } else {
      const order = mockStore.orders.find((o) => o._id.toString() === id.toString());
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: order });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order dispatch status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private / Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const timeline = generateTimeline(status);

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.trackingTimeline = timeline;
      if (status === 'Delivered') {
        order.paymentStatus = 'Paid / Settled';
      }
      await order.save();

      return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    } else {
      const order = mockStore.orders.find((o) => o._id.toString() === id.toString());
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.status = status;
      order.trackingTimeline = timeline;
      if (status === 'Delivered') {
        order.paymentStatus = 'Paid / Settled';
      }

      return res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
