const mongoose = require('mongoose');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const matchesCategory = (productCat, selectedCat) => {
  if (!selectedCat || selectedCat === 'All') return true;
  const p = (productCat || '').toLowerCase();
  const s = selectedCat.toLowerCase();
  if (p === s) return true;
  if (p.includes(s) || s.includes(p)) return true;

  // Normalized synonyms
  if (s.includes('seed') && p.includes('seed')) return true;
  if (s.includes('fertilizer') && p.includes('fertilizer')) return true;
  if (s.includes('pest') && (p.includes('pest') || p.includes('protect'))) return true;
  if (s.includes('irrigation') && (p.includes('irrigation') || p.includes('tool'))) return true;
  if (s.includes('soil') && (p.includes('soil') || p.includes('kit') || p.includes('amendment'))) return true;

  return false;
};

// @desc    Get all marketplace products with search and category filters
// @route   GET /api/products and GET /api/resources
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    if (isDBConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      let products = await Product.find(query).sort({ rating: -1, createdAt: -1 });

      if (category && category !== 'All') {
        products = products.filter((item) => matchesCategory(item.category, category));
      }

      return res.json({ success: true, count: products.length, data: products });
    } else {
      let products = mockStore.products;

      if (category && category !== 'All') {
        products = products.filter((p) => matchesCategory(p.category, category));
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

// @desc    Create product
// @route   POST /api/products
// @access  Private / Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      unit,
      description,
      stock,
      imageUrl,
      badge,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required',
      });
    }

    if (isDBConnected()) {
      const product = await Product.create({
        name,
        category,
        price: Number(price),
        unit: unit || '1 Unit',
        description: description || '',
        stock: Number(stock) || 50,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        badge: badge || 'New',
        inStock: (Number(stock) || 50) > 0,
      });

      return res.status(201).json({ success: true, message: 'Product created', data: product });
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
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        badge: badge || 'New',
        inStock: (Number(stock) || 50) > 0,
        createdAt: new Date(),
      };

      mockStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, message: 'Product created', data: newProduct });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private / Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product updated', data: product });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === id.toString());
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      Object.assign(product, req.body);
      return res.json({ success: true, message: 'Product updated', data: product });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private / Admin
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted' });
    } else {
      const index = mockStore.products.findIndex((p) => p._id.toString() === id.toString());
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      mockStore.products.splice(index, 1);
      return res.json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
