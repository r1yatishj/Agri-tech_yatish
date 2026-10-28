const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide farm name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide farm location / village'],
      trim: true,
    },
    sizeAcres: {
      type: Number,
      required: [true, 'Please specify farm size in acres'],
      min: [0.1, 'Size must be at least 0.1 acres'],
    },
    soilType: {
      type: String,
      required: [true, 'Please select a soil type'],
      enum: ['Loamy', 'Clay', 'Sandy', 'Black Soil', 'Alluvial', 'Red Soil'],
      default: 'Loamy',
    },
    cropsGrown: [
      {
        type: String,
        trim: true,
      },
    ],
    irrigationType: {
      type: String,
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal Irrigation', 'Tube Well', 'Rainfed'],
      default: 'Drip Irrigation',
    },
    soilHealthSummary: {
      lastTested: { type: Date, default: Date.now },
      averagePH: { type: Number, default: 6.8 },
      averageMoisture: { type: Number, default: 45 }, // percentage
      healthGrade: { type: String, enum: ['Optimal', 'Good', 'Needs Care', 'Degraded'], default: 'Good' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farm', farmSchema);
