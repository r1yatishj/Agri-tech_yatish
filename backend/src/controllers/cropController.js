const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// Helper to compute agronomic advice from NPK & soil stats
const computeSoilRecommendation = (n, p, k, moisture, ph) => {
  const recommendations = [];

  // Nitrogen advice
  if (n < 120) {
    recommendations.push('Nitrogen is below threshold (<120 mg/kg): Apply organic neem-coated urea or well-rotted vermicompost to prevent chlorosis.');
  } else if (n > 200) {
    recommendations.push('Excess Nitrogen (>200 mg/kg): Halt urea/chemical nitrogen to avoid excessive vegetative rank growth and lodging.');
  } else {
    recommendations.push('Nitrogen level is optimal.');
  }

  // Phosphorus advice
  if (p < 25) {
    recommendations.push('Phosphorus is deficient (<25 mg/kg): Supplement with Single Super Phosphate (SSP) or bone meal to strengthen root development.');
  } else {
    recommendations.push('Phosphorus level supports healthy root elongation.');
  }

  // Potassium advice
  if (k < 150) {
    recommendations.push('Potassium is low (<150 mg/kg): Apply Muriate of Potash (MOP) to boost grain filling and disease resistance.');
  }

  // Moisture advice
  if (moisture < 35) {
    recommendations.push('Moisture critical alert (<35%): Deep root irrigation recommended within 24-48 hours.');
  } else if (moisture > 70) {
    recommendations.push('High moisture saturation (>70%): Clear field drainage channels to prevent fungal root rot and aeration loss.');
  }

  // pH advice
  if (ph < 6.0) {
    recommendations.push('Soil is acidic (pH < 6.0): Broadcast agricultural lime/dolomite (150-200 kg/acre).');
  } else if (ph > 7.8) {
    recommendations.push('Soil is alkaline (pH > 7.8): Apply agricultural gypsum or sulfur to neutralize alkalinity.');
  }

  return recommendations.join(' ');
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
      return res.json({ success: true, count: crops.length, data: crops });
    } else {
      let crops = mockStore.crops;
      if (req.user.role !== 'admin') {
        crops = crops.filter((c) => c.farmerId.toString() === req.user._id.toString());
      }
      if (farmId) {
        crops = crops.filter((c) => c.farmId.toString() === farmId.toString());
      }
      return res.json({ success: true, count: crops.length, data: crops });
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
      return res.json({ success: true, data: crop });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) {
        return res.status(404).json({ success: false, message: 'Crop not found' });
      }
      const farm = mockStore.farms.find((f) => f._id.toString() === crop.farmId.toString());
      return res.json({ success: true, data: { ...crop, farmId: farm || crop.farmId } });
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
      plantingDate,
      expectedHarvestDate,
      healthStatus,
      stages,
      soilHealth,
      notes,
    } = req.body;

    if (!farmId || !cropName || !plantingDate || !expectedHarvestDate) {
      return res.status(400).json({
        success: false,
        message: 'Farm, crop name, planting date, and harvest date are required',
      });
    }

    const initialSoil = soilHealth || {
      nitrogen: 140,
      phosphorus: 35,
      potassium: 200,
      moisture: 45,
      ph: 6.8,
      temperatureC: 25,
      lastTested: new Date(),
    };

    initialSoil.aiRecommendation = computeSoilRecommendation(
      initialSoil.nitrogen,
      initialSoil.phosphorus,
      initialSoil.potassium,
      initialSoil.moisture,
      initialSoil.ph
    );

    if (isDBConnected()) {
      const crop = await Crop.create({
        farmId,
        farmerId: req.user._id,
        cropName,
        variety: variety || 'Standard High-Yield Hybrid',
        plantingDate,
        expectedHarvestDate,
        healthStatus: healthStatus || 'Healthy',
        stages: stages || { currentStage: 'Germination', stageProgressPercent: 15 },
        soilHealth: initialSoil,
        notes: notes || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Crop registered and monitored successfully',
        data: crop,
      });
    } else {
      const newCrop = {
        _id: 'crop_' + Date.now(),
        farmId,
        farmerId: req.user._id,
        cropName,
        variety: variety || 'Standard High-Yield Hybrid',
        plantingDate: new Date(plantingDate),
        expectedHarvestDate: new Date(expectedHarvestDate),
        healthStatus: healthStatus || 'Healthy',
        stages: stages || { currentStage: 'Germination', stageProgressPercent: 15 },
        soilHealth: initialSoil,
        notes: notes || '',
        createdAt: new Date(),
      };

      mockStore.crops.unshift(newCrop);
      return res.status(201).json({
        success: true,
        message: 'Crop registered and monitored successfully',
        data: newCrop,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crop stage, health, or notes
// @route   PUT /api/crops/:id
// @access  Private
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { cropName, variety, healthStatus, stages, notes, expectedHarvestDate } = req.body;

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (cropName) crop.cropName = cropName;
      if (variety) crop.variety = variety;
      if (healthStatus) crop.healthStatus = healthStatus;
      if (stages) crop.stages = { ...crop.stages, ...stages };
      if (notes !== undefined) crop.notes = notes;
      if (expectedHarvestDate) crop.expectedHarvestDate = expectedHarvestDate;

      const updated = await crop.save();
      return res.json({ success: true, message: 'Crop status updated', data: updated });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (cropName) crop.cropName = cropName;
      if (variety) crop.variety = variety;
      if (healthStatus) crop.healthStatus = healthStatus;
      if (stages) crop.stages = { ...crop.stages, ...stages };
      if (notes !== undefined) crop.notes = notes;
      if (expectedHarvestDate) crop.expectedHarvestDate = new Date(expectedHarvestDate);

      return res.json({ success: true, message: 'Crop status updated', data: crop });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log new soil health test (NPK, moisture, pH)
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
    const t = Number(temperatureC) || 25;

    const recommendation = computeSoilRecommendation(n, p, k, m, pVal);

    const soilData = {
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      moisture: m,
      ph: pVal,
      temperatureC: t,
      lastTested: new Date(),
      aiRecommendation: recommendation,
    };

    if (isDBConnected()) {
      const crop = await Crop.findById(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      crop.soilHealth = soilData;

      // Automatically adjust health status if critical
      if (m < 25 || pVal < 5.2 || pVal > 8.5) {
        crop.healthStatus = 'Critical';
      } else if (m < 35 || n < 100 || p < 20 || k < 120) {
        crop.healthStatus = 'Attention Needed';
      } else {
        crop.healthStatus = 'Healthy';
      }

      await crop.save();
      return res.json({
        success: true,
        message: 'Soil health metrics updated with AI recommendation',
        data: crop,
      });
    } else {
      const crop = mockStore.crops.find((c) => c._id.toString() === id.toString());
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      crop.soilHealth = soilData;
      if (m < 25 || pVal < 5.2 || pVal > 8.5) {
        crop.healthStatus = 'Critical';
      } else if (m < 35 || n < 100 || p < 20 || k < 120) {
        crop.healthStatus = 'Attention Needed';
      } else {
        crop.healthStatus = 'Healthy';
      }

      return res.json({
        success: true,
        message: 'Soil health metrics updated with AI recommendation',
        data: crop,
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
      await Crop.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Crop deleted' });
    } else {
      mockStore.crops = mockStore.crops.filter((c) => c._id.toString() !== id.toString());
      return res.json({ success: true, message: 'Crop deleted' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
