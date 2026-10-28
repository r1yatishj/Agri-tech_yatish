const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: [true, 'Please provide crop name'],
      trim: true,
    },
    variety: {
      type: String,
      default: 'Standard Hybrid',
      trim: true,
    },
    plantingDate: {
      type: Date,
      required: [true, 'Please provide planting date'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Please provide expected harvest date'],
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Good', 'Attention Needed', 'Pest Risk', 'Critical'],
      default: 'Healthy',
    },
    stages: {
      currentStage: {
        type: String,
        enum: ['Germination', 'Vegetative', 'Flowering', 'Yield Formation', 'Maturity', 'Harvested'],
        default: 'Vegetative',
      },
      stageProgressPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 35,
      },
    },
    soilHealth: {
      nitrogen: { type: Number, default: 140 }, // mg/kg (optimal: 120-180)
      phosphorus: { type: Number, default: 35 }, // mg/kg (optimal: 25-50)
      potassium: { type: Number, default: 210 }, // mg/kg (optimal: 150-250)
      moisture: { type: Number, default: 48 }, // % (optimal: 40-60%)
      ph: { type: Number, default: 6.5 }, // pH scale 0-14
      temperatureC: { type: Number, default: 24 }, // Soil temp in Celsius
      lastTested: { type: Date, default: Date.now },
      aiRecommendation: {
        type: String,
        default: 'NPK balance is stable. Maintain standard watering cycle every 3 days.',
      },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);
