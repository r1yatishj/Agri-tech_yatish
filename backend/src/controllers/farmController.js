const mongoose = require('mongoose');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const formatFarm = (farm) => {
  const f = farm.toObject ? farm.toObject() : { ...farm };
  const size = f.sizeAcres || f.totalArea?.value || 5;
  const name = f.farmName || f.name || 'Unnamed Farm';
  return {
    ...f,
    _id: f._id.toString(),
    farmName: name,
    name: name,
    sizeAcres: size,
    totalArea: f.totalArea || { value: size, unit: 'Acres' },
    location: f.location || { village: 'Sultanpur', district: 'Kota', state: 'Rajasthan' },
    cropsGrown: f.cropsGrown || ['Wheat', 'Rice'],
    irrigationType: f.irrigationType || 'Drip Irrigation',
    soilType: f.soilType || 'Loamy',
  };
};

// @desc    Get all farms for current user (or all if admin)
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res) => {
  try {
    if (isDBConnected()) {
      const query = req.user.role === 'admin' ? {} : { farmerId: req.user._id };
      const rawFarms = await Farm.find(query).sort({ createdAt: -1 });
      const farms = rawFarms.map(formatFarm);
      return res.json({ success: true, count: farms.length, data: farms });
    } else {
      const rawFarms =
        req.user.role === 'admin'
          ? mockStore.farms
          : mockStore.farms.filter(
              (f) => f.farmerId.toString() === req.user._id.toString()
            );
      const farms = rawFarms.map(formatFarm);
      return res.json({ success: true, count: farms.length, data: farms });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single farm details with attached crops
// @route   GET /api/farms/:id
// @access  Private
exports.getFarmById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const farm = await Farm.findById(id);
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm profile not found' });
      }

      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this farm' });
      }

      const crops = await Crop.find({ farmId: farm._id });
      return res.json({ success: true, data: { ...formatFarm(farm), crops } });
    } else {
      const farm = mockStore.farms.find((f) => f._id.toString() === id.toString());
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm profile not found' });
      }

      const crops = mockStore.crops.filter((c) => c.farmId.toString() === id.toString());
      return res.json({ success: true, data: { ...formatFarm(farm), crops } });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new farm profile
// @route   POST /api/farms
// @access  Private
exports.createFarm = async (req, res) => {
  try {
    const {
      name,
      farmName,
      location,
      sizeAcres,
      totalArea,
      soilType,
      cropsGrown,
      irrigationType
    } = req.body;

    const resolvedName = farmName || name;
    const resolvedSize = totalArea?.value || sizeAcres || 5;

    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: 'Farm name is required',
      });
    }

    const cropsList = Array.isArray(cropsGrown)
      ? cropsGrown
      : typeof cropsGrown === 'string'
      ? cropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
      : ['Wheat', 'Basmati Rice'];

    let locString = 'Kota, Rajasthan';
    if (typeof location === 'string') {
      locString = location;
    } else if (location && typeof location === 'object') {
      locString = `${location.village || ''}, ${location.district || ''}, ${location.state || ''}`.replace(/^, |, $/g, '').trim() || 'Kota, Rajasthan';
    }

    if (isDBConnected()) {
      const farm = await Farm.create({
        farmerId: req.user._id,
        name: resolvedName,
        location: locString,
        sizeAcres: Number(resolvedSize),
        soilType: soilType || 'Loamy',
        cropsGrown: cropsList,
        irrigationType: irrigationType || 'Drip Irrigation',
        soilHealthSummary: {
          lastTested: new Date(),
          averagePH: 6.8,
          averageMoisture: 45,
          healthGrade: 'Good',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Farm profile registered successfully',
        data: formatFarm({
          ...farm.toObject(),
          farmName: resolvedName,
          totalArea: { value: Number(resolvedSize), unit: 'Acres' },
          location: location || locString,
        }),
      });
    } else {
      const newFarm = {
        _id: 'farm_' + Date.now(),
        farmerId: req.user._id,
        name: resolvedName,
        farmName: resolvedName,
        location: location || locString,
        sizeAcres: Number(resolvedSize),
        totalArea: { value: Number(resolvedSize), unit: 'Acres' },
        soilType: soilType || 'Loamy',
        cropsGrown: cropsList,
        irrigationType: irrigationType || 'Drip Irrigation',
        soilHealthSummary: {
          lastTested: new Date(),
          averagePH: 6.8,
          averageMoisture: 45,
          healthGrade: 'Good',
        },
        createdAt: new Date(),
      };

      mockStore.farms.unshift(newFarm);
      return res.status(201).json({
        success: true,
        message: 'Farm profile registered successfully',
        data: formatFarm(newFarm),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update farm profile
// @route   PUT /api/farms/:id
// @access  Private
exports.updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, farmName, location, sizeAcres, totalArea, soilType, irrigationType } = req.body;

    const resolvedName = farmName || name;
    const resolvedSize = totalArea?.value || sizeAcres;

    if (isDBConnected()) {
      const farm = await Farm.findById(id);
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm profile not found' });
      }

      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (resolvedName) farm.name = resolvedName;
      if (location) {
        farm.location = typeof location === 'string' ? location : `${location.village || ''}, ${location.district || ''}, ${location.state || ''}`;
      }
      if (resolvedSize) farm.sizeAcres = Number(resolvedSize);
      if (soilType) farm.soilType = soilType;
      if (irrigationType) farm.irrigationType = irrigationType;

      await farm.save();
      return res.json({ success: true, message: 'Farm updated', data: formatFarm(farm) });
    } else {
      const farm = mockStore.farms.find((f) => f._id.toString() === id.toString());
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm profile not found' });
      }

      if (resolvedName) {
        farm.name = resolvedName;
        farm.farmName = resolvedName;
      }
      if (location) farm.location = location;
      if (resolvedSize) {
        farm.sizeAcres = Number(resolvedSize);
        farm.totalArea = { value: Number(resolvedSize), unit: 'Acres' };
      }
      if (soilType) farm.soilType = soilType;
      if (irrigationType) farm.irrigationType = irrigationType;

      return res.json({ success: true, message: 'Farm updated', data: formatFarm(farm) });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete farm profile
// @route   DELETE /api/farms/:id
// @access  Private
exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const farm = await Farm.findById(id);
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this farm' });
      }

      await Farm.findByIdAndDelete(id);
      await Crop.deleteMany({ farmId: id });
      return res.json({ success: true, message: 'Farm profile and related crops deleted' });
    } else {
      const index = mockStore.farms.findIndex((f) => f._id.toString() === id.toString());
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      mockStore.farms.splice(index, 1);
      mockStore.crops = mockStore.crops.filter((c) => c.farmId.toString() !== id.toString());
      return res.json({ success: true, message: 'Farm profile and related crops deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
