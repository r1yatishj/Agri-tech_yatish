const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const computeSoilRecommendation = (n, p, k, moisture, ph) => {
  const recommendations = [];
  if (n < 240) {
    recommendations.push('Nitrogen is critically low (<240 kg/ha): Apply neem-coated urea in split doses or vermicompost.');
  } else if (n > 450) {
    recommendations.push('Nitrogen is excessive (>450 kg/ha): Suspend synthetic N application to prevent vegetative lodging.');
  } else {
    recommendations.push('Nitrogen is in optimal vegetative range (240-450 kg/ha).');
  }

  if (p < 20) {
    recommendations.push('Phosphorus is deficient (<20 kg/ha): Apply SSP (Single Super Phosphate) or rock phosphate.');
  } else {
    recommendations.push('Phosphorus is adequate for root elongation and tillering.');
  }

  if (k < 150) {
    recommendations.push('Potassium is low (<150 kg/ha): Broadcast Muriate of Potash (MOP) to boost grain filling.');
  } else {
    recommendations.push('Potassium reserves are sufficient for drought and disease resilience.');
  }

  if (moisture < 35) {
    recommendations.push('Soil moisture is below 35%: Immediate micro-irrigation advised.');
  } else if (moisture > 75) {
    recommendations.push('Waterlogging risk (>75% moisture): Clear drainage canals immediately.');
  }

  if (ph < 6.0) {
    recommendations.push('Soil is acidic (pH < 6.0): Broadcast agricultural lime/dolomite (150-200 kg/acre).');
  } else if (ph > 7.8) {
    recommendations.push('Soil is alkaline (pH > 7.8): Apply agricultural gypsum or elemental sulfur.');
  }

  return recommendations.join(' ');
};

const formatCrop = (crop) => {
  const c = crop.toObject ? crop.toObject() : { ...crop };
  const currentStage = c.stage || (typeof c.stages === 'string' ? c.stages : c.stages?.currentStage) || 'Vegetative';
  const soil = c.soilMetrics || c.soilHealth || {
    ph: 6.8,
    moisture: 45,
    nitrogen: 280,
    phosphorus: 24,
    potassium: 200,
  };

  return {
    ...c,
    _id: c._id.toString(),
    cropName: c.cropName || c.name || 'Hybrid Crop',
    variety: c.variety || 'Standard High-Yield Hybrid',
    areaAllocated: c.areaAllocated || c.areaAcres || 2.5,
    stage: currentStage,
    stages: c.stages || { currentStage, stageProgressPercent: 50 },
    healthStatus: c.healthStatus || 'Good',
    soilMetrics: soil,
    soilHealth: soil,
    activities: c.activities || [],
    plantingDate: c.plantingDate || new Date(),
    expectedHarvestDate: c.expectedHarvestDate || new Date(Date.now() + 90 * 86400000),
  };
};

// @desc    Get crops (filter by farmId or get all for logged in user)
// @route   GET /api/crops
// @access  Private
exports.getCrops = async (req, res) => {
  try {
    const { farmId } = req.query;

    if (isDBConnected()) {
      const query = { farmerId: req.user._id };
      if (farmId) query.farmId = farmId;
      if (req.user.role === 'admin' && !farmId) delete query.farmerId;

      const crops = await Crop.find(query).populate('farmId', 'name location soilType').sort({ createdAt: -1 });
      return res.json({ success: true, count: crops.length, data: crops.map(formatCrop) });
    } else {
      let crops = mockStore.crops;
      if (req.user.role !== 'admin') {
        crops = crops.filter((c) => c.farmerId.toString() === req.user._id.toString());
      }
      if (farmId) {
        crops = crops.filter((c) => c.farmId.toString() === farmId.toString());
      }
      return res.json({ success: true, count: crops.length, data: crops.map(formatCrop) });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
exports.getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const crop = await Crop.findById(id).populate('farmId', 'name location sizeAcres soilType');
      if (!crop) {
        return res.status(404).json({ success: false, message: 'Crop not found' });
      }
      return res.json({ success: true, data: formatCrop(crop) });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) {
        return res.status(404).json({ success: false, message: 'Crop not found' });
      }
      const farm = mockStore.farms.find((f) => f._id.toString() === crop.farmId.toString());
      return res.json({ success: true, data: { ...formatCrop(crop), farmId: farm || crop.farmId } });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new crop to a farm
// @route   POST /api/crops
// @access  Private
exports.createCrop = async (req, res) => {
  try {
    const {
      farmId,
      cropName,
      variety,
      areaAllocated,
      plantingDate,
      expectedHarvestDate,
      healthStatus,
      stage,
      stages,
      soilMetrics,
      soilHealth,
      notes,
    } = req.body;

    if (!farmId || !cropName) {
      return res.status(400).json({
        success: false,
        message: 'Farm and crop name are required',
      });
    }

    const currentStage = stage || (typeof stages === 'string' ? stages : stages?.currentStage) || 'Germination';
    const soil = soilMetrics || soilHealth || {
      nitrogen: 250,
      phosphorus: 25,
      potassium: 190,
      moisture: 45,
      ph: 6.8,
    };

    if (isDBConnected()) {
      const crop = await Crop.create({
        farmId,
        farmerId: req.user._id,
        cropName,
        variety: variety || 'Standard High-Yield Hybrid',
        areaAllocated: Number(areaAllocated) || 2.0,
        plantingDate: plantingDate || new Date(),
        expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 90 * 86400000),
        healthStatus: healthStatus || 'Good',
        stage: currentStage,
        stages: { currentStage, stageProgressPercent: 15 },
        soilMetrics: soil,
        soilHealth: soil,
        activities: [],
        notes: notes || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Crop registered to farm successfully',
        data: formatCrop(crop),
      });
    } else {
      const newCrop = {
        _id: 'crop_' + Date.now(),
        farmId,
        farmerId: req.user._id,
        cropName,
        variety: variety || 'Standard High-Yield Hybrid',
        areaAllocated: Number(areaAllocated) || 2.0,
        plantingDate: plantingDate || new Date(),
        expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 90 * 86400000),
        healthStatus: healthStatus || 'Good',
        stage: currentStage,
        stages: { currentStage, stageProgressPercent: 15 },
        soilMetrics: soil,
        soilHealth: soil,
        activities: [],
        notes: notes || '',
        createdAt: new Date(),
      };

      mockStore.crops.unshift(newCrop);
      return res.status(201).json({
        success: true,
        message: 'Crop registered to farm successfully',
        data: formatCrop(newCrop),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crop (stage, health, notes, etc.)
// @route   PUT /api/crops/:id
// @access  Private
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, stages, healthStatus, notes, areaAllocated, cropName, variety } = req.body;

    const newStage = stage || (typeof stages === 'string' ? stages : stages?.currentStage);

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (newStage) {
        crop.stage = newStage;
        crop.stages = { currentStage: newStage, stageProgressPercent: crop.stages?.stageProgressPercent || 50 };
      }
      if (healthStatus) crop.healthStatus = healthStatus;
      if (notes !== undefined) crop.notes = notes;
      if (areaAllocated) crop.areaAllocated = Number(areaAllocated);
      if (cropName) crop.cropName = cropName;
      if (variety) crop.variety = variety;

      await crop.save();
      return res.json({ success: true, message: 'Crop updated successfully', data: formatCrop(crop) });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (newStage) {
        crop.stage = newStage;
        crop.stages = { currentStage: newStage, stageProgressPercent: crop.stages?.stageProgressPercent || 50 };
      }
      if (healthStatus) crop.healthStatus = healthStatus;
      if (notes !== undefined) crop.notes = notes;
      if (areaAllocated) crop.areaAllocated = Number(areaAllocated);
      if (cropName) crop.cropName = cropName;
      if (variety) crop.variety = variety;

      return res.json({ success: true, message: 'Crop updated successfully', data: formatCrop(crop) });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log field activity for a crop
// @route   POST /api/crops/:id/activity
// @access  Private
exports.addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, waterAmount, fertilizerUsed } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, message: 'Action name is required' });
    }

    const activityEntry = {
      _id: 'act_' + Date.now(),
      action,
      notes: notes || '',
      waterAmount: waterAmount || 'N/A',
      fertilizerUsed: fertilizerUsed || 'None',
      date: new Date(),
    };

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (!crop.activities) crop.activities = [];
      crop.activities.unshift(activityEntry);
      await crop.save();

      return res.status(201).json({
        success: true,
        message: 'Field activity logged successfully',
        data: formatCrop(crop),
      });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (!crop.activities) crop.activities = [];
      crop.activities.unshift(activityEntry);

      return res.status(201).json({
        success: true,
        message: 'Field activity logged successfully',
        data: formatCrop(crop),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update soil health test values
// @route   PUT /api/crops/:id/soil-health
// @access  Private
exports.updateSoilHealth = async (req, res) => {
  try {
    const { id } = req.params;
    const { nitrogen, phosphorus, potassium, moisture, ph, temperatureC } = req.body;

    const n = Number(nitrogen) || 140;
    const p = Number(phosphorus) || 35;
    const k = Number(potassium) || 200;
    const m = Number(moisture) || 45;
    const pVal = Number(ph) || 6.8;

    const recommendation = computeSoilRecommendation(n, p, k, m, pVal);

    const soilData = {
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      moisture: m,
      ph: pVal,
      temperatureC: Number(temperatureC) || 25,
      lastTested: new Date(),
      aiRecommendation: recommendation,
    };

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      crop.soilHealth = soilData;
      crop.soilMetrics = soilData;
      await crop.save();

      return res.json({
        success: true,
        message: 'Soil health metrics updated with AI recommendation',
        data: formatCrop(crop),
      });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      crop.soilHealth = soilData;
      crop.soilMetrics = soilData;

      return res.json({
        success: true,
        message: 'Soil health metrics updated with AI recommendation',
        data: formatCrop(crop),
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      await Crop.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Crop removed from farm plan' });
    } else {
      const index = mockStore.crops.findIndex((c) => c._id.toString() === id.toString());
      if (index === -1) return res.status(404).json({ success: false, message: 'Crop not found' });

      mockStore.crops.splice(index, 1);
      return res.json({ success: true, message: 'Crop removed from farm plan' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
