const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        unit: { type: String, default: 'Unit' },
        category: { type: String, default: 'General' },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      villageOrCity: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    trackingTimeline: [
      {
        stage: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false },
        detail: { type: String, default: '' },
      },
    ],
    paymentMethod: {
      type: String,
      default: 'Kisan Credit Card / Cash On Delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'COD Verified'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
