const mongoose = require('mongoose');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all farms for current user (or all if admin)
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res) => {
  try {
    if (isDBConnected()) {
      const query = req.user.role === 'admin' ? {} : { farmerId: req.user._id };
      const farms = await Farm.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: farms.length, data: farms });
    } else {
      const farms =
        req.user.role === 'admin'
          ? mockStore.farms
          : mockStore.farms.filter(
              (f) => f.farmerId.toString() === req.user._id.toString()
            );
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

      // Check ownership or admin
      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this farm' });
      }

      const crops = await Crop.find({ farmId: farm._id });
      return res.json({ success: true, data: { ...farm.toObject(), crops } });
    } else {
      const farm = mockStore.farms.find((f) => f._id.toString() === id.toString());
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm profile not found' });
      }

      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this farm' });
      }

      const crops = mockStore.crops.filter((c) => c.farmId.toString() === farm._id.toString());
      return res.json({ success: true, data: { ...farm, crops } });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new farm
// @route   POST /api/farms
// @access  Private
exports.createFarm = async (req, res) => {
  try {
    const { name, location, sizeAcres, soilType, cropsGrown, irrigationType } = req.body;

    if (!name || !location || !sizeAcres) {
      return res.status(400).json({
        success: false,
        message: 'Farm name, location, and size in acres are required',
      });
    }

    const cropsList = Array.isArray(cropsGrown)
      ? cropsGrown
      : typeof cropsGrown === 'string'
      ? cropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    if (isDBConnected()) {
      const farm = await Farm.create({
        farmerId: req.user._id,
        name,
        location,
        sizeAcres: Number(sizeAcres),
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
        data: farm,
      });
    } else {
      const newFarm = {
        _id: 'farm_' + Date.now(),
        farmerId: req.user._id,
        name,
        location,
        sizeAcres: Number(sizeAcres),
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
        data: newFarm,
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
    const { name, location, sizeAcres, soilType, cropsGrown, irrigationType } = req.body;

    const cropsList = cropsGrown
      ? Array.isArray(cropsGrown)
        ? cropsGrown
        : cropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
      : undefined;

    if (isDBConnected()) {
      let farm = await Farm.findById(id);
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      if (req.user.role !== 'admin' && farm.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this farm' });
      }

      farm.name = name || farm.name;
      farm.location = location || farm.location;
      if (sizeAcres) farm.sizeAcres = Number(sizeAcres);
      if (soilType) farm.soilType = soilType;
      if (cropsList) farm.cropsGrown = cropsList;
      if (irrigationType) farm.irrigationType = irrigationType;

      const updated = await farm.save();
      return res.json({ success: true, message: 'Farm profile updated', data: updated });
    } else {
      const farm = mockStore.farms.find((f) => f._id.toString() === id.toString());
      if (!farm) {
        return res.status(404).json({ success: false, message: 'Farm not found' });
      }

      if (name) farm.name = name;
      if (location) farm.location = location;
      if (sizeAcres) farm.sizeAcres = Number(sizeAcres);
      if (soilType) farm.soilType = soilType;
      if (cropsList) farm.cropsGrown = cropsList;
      if (irrigationType) farm.irrigationType = irrigationType;

      return res.json({ success: true, message: 'Farm profile updated', data: farm });
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
