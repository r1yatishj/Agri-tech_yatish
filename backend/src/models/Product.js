const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['Seeds', 'Bio-Fertilizers', 'Pest Control', 'Irrigation & Tools', 'Soil Amendments'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price in INR'],
      min: 0,
    },
    unit: {
      type: String,
      default: '1 Unit',
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
    },
    badge: {
      type: String,
      default: 'Top Choice',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
