const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: [true, 'Please provide region or district'],
      trim: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    rainfall: {
      type: Number,
      default: 0,
    },
    windSpeed: {
      type: Number,
      default: 12,
    },
    pestRiskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true,
    },
    advisoryMessage: {
      type: String,
      required: true,
    },
    identifiedThreat: {
      type: String,
      default: 'None / Low Incidence',
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    affectedCrops: [
      {
        type: String,
      },
    ],
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Danger', 'Critical'],
      default: 'Warning',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);
