const mongoose = require('mongoose');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all marketplace products with search and category filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    if (isDBConnected()) {
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const products = await Product.find(query).sort({ rating: -1, createdAt: -1 });
      return res.json({ success: true, count: products.length, data: products });
    } else {
      let products = mockStore.products;
      if (category && category !== 'All') {
        products = products.filter((p) => p.category === category);
      }
      if (search) {
        const s = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, count: products.length, data: products });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === id.toString());
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/products
// @access  Private / Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, description, stock, imageUrl, badge } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    if (isDBConnected()) {
      const product = await Product.create({
        name,
        category,
        price: Number(price),
        unit: unit || '1 Unit',
        description: description || '',
        stock: Number(stock) || 50,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
        badge: badge || 'Verified',
      });
      return res.status(201).json({ success: true, message: 'Product added to marketplace', data: product });
    } else {
      const newProduct = {
        _id: 'prod_' + Date.now(),
        name,
        category,
        price: Number(price),
        unit: unit || '1 Unit',
        description: description || '',
        stock: Number(stock) || 50,
        rating: 5.0,
        reviewCount: 1,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
        badge: badge || 'Verified',
        inStock: true,
        createdAt: new Date(),
      };
      mockStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, message: 'Product added to marketplace', data: newProduct });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private / Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, unit, description, stock, badge } = req.body;

    if (isDBConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      if (name) product.name = name;
      if (category) product.category = category;
      if (price) product.price = Number(price);
      if (unit) product.unit = unit;
      if (description) product.description = description;
      if (stock !== undefined) product.stock = Number(stock);
      if (badge) product.badge = badge;

      await product.save();
      return res.json({ success: true, message: 'Product updated', data: product });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === id.toString());
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      if (name) product.name = name;
      if (category) product.category = category;
      if (price) product.price = Number(price);
      if (unit) product.unit = unit;
      if (description) product.description = description;
      if (stock !== undefined) product.stock = Number(stock);
      if (badge) product.badge = badge;

      return res.json({ success: true, message: 'Product updated', data: product });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private / Admin
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted from marketplace' });
    } else {
      mockStore.products = mockStore.products.filter((p) => p._id.toString() !== id.toString());
      return res.json({ success: true, message: 'Product deleted from marketplace' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
