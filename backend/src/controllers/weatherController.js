const mongoose = require('mongoose');
const WeatherAlert = require('../models/WeatherAlert');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get live/simulated microclimate weather & 5-day forecast
// @route   GET /api/weather
// @access  Public / Private
exports.getWeather = async (req, res) => {
  try {
    const region = req.query.region || 'Kota Agrarian Belt';

    // Microclimate data generator based on region
    const currentWeather = {
      region,
      temperatureC: 31,
      feelsLikeC: 34,
      condition: 'Partly Cloudy with Humid Breeze',
      humidityPercent: 78,
      windSpeedKmh: 14,
      windDirection: 'North-West (NW)',
      rainProbabilityPercent: 40,
      uvIndex: 7, // High
      barometricPressureHpa: 1012,
      evapotranspirationRate: '4.2 mm/day',
      irrigationAdvisory: 'Moderate soil moisture loss. Optimal watering window: 05:30 AM - 08:30 AM or post-sunset.',
      pestVulnerabilityStatus: 'Elevated fungal and sucking pest risk due to >75% humidity.',
      forecast: [
        { day: 'Today', tempMax: 33, tempMin: 22, rainChance: 40, condition: 'Partly Cloudy' },
        { day: 'Tomorrow', tempMax: 34, tempMin: 23, rainChance: 65, condition: 'Scattered Showers' },
        { day: 'Day 3', tempMax: 31, tempMin: 21, rainChance: 30, condition: 'Overcast' },
        { day: 'Day 4', tempMax: 32, tempMin: 20, rainChance: 10, condition: 'Sunny' },
        { day: 'Day 5', tempMax: 35, tempMin: 23, rainChance: 5, condition: 'Clear Sky' },
      ],
      hourlyForecast: [
        { time: '06:00', temp: 22, humidity: 88, rain: 20 },
        { time: '09:00', temp: 26, humidity: 82, rain: 30 },
        { time: '12:00', temp: 31, humidity: 74, rain: 45 },
        { time: '15:00', temp: 33, humidity: 70, rain: 50 },
        { time: '18:00', temp: 29, humidity: 78, rain: 40 },
        { time: '21:00', temp: 25, humidity: 84, rain: 25 },
      ],
    };

    return res.json({ success: true, data: currentWeather });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active weather and pest alerts
// @route   GET /api/weather/alerts
// @access  Public / Private
exports.getAlerts = async (req, res) => {
  try {
    if (isDBConnected()) {
      const alerts = await WeatherAlert.find({ isActive: true }).sort({ createdAt: -1 });
      return res.json({ success: true, count: alerts.length, data: alerts });
    } else {
      const alerts = mockStore.weatherAlerts.filter((a) => a.isActive !== false);
      return res.json({ success: true, count: alerts.length, data: alerts });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create / Broadcast new weather or pest alert (Admin only)
// @route   POST /api/weather/alerts
// @access  Private / Admin
exports.createAlert = async (req, res) => {
  try {
    const {
      region,
      temperature,
      humidity,
      rainfall,
      windSpeed,
      pestRiskLevel,
      advisoryMessage,
      identifiedThreat,
      recommendedAction,
      affectedCrops,
      severity,
    } = req.body;

    if (!region || !pestRiskLevel || !advisoryMessage || !recommendedAction) {
      return res.status(400).json({
        success: false,
        message: 'Region, pest risk level, advisory message, and recommended action are required',
      });
    }

    const cropsList = Array.isArray(affectedCrops)
      ? affectedCrops
      : typeof affectedCrops === 'string'
      ? affectedCrops.split(',').map((c) => c.trim()).filter(Boolean)
      : ['General Crops'];

    if (isDBConnected()) {
      const alert = await WeatherAlert.create({
        region,
        temperature: Number(temperature) || 30,
        humidity: Number(humidity) || 75,
        rainfall: Number(rainfall) || 0,
        windSpeed: Number(windSpeed) || 12,
        pestRiskLevel,
        advisoryMessage,
        identifiedThreat: identifiedThreat || 'Pest / Weather Anomaly',
        recommendedAction,
        affectedCrops: cropsList,
        severity: severity || 'Warning',
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Weather & pest advisory broadcasted to farmers',
        data: alert,
      });
    } else {
      const newAlert = {
        _id: 'alert_' + Date.now(),
        region,
        temperature: Number(temperature) || 30,
        humidity: Number(humidity) || 75,
        rainfall: Number(rainfall) || 0,
        windSpeed: Number(windSpeed) || 12,
        pestRiskLevel,
        advisoryMessage,
        identifiedThreat: identifiedThreat || 'Pest / Weather Anomaly',
        recommendedAction,
        affectedCrops: cropsList,
        severity: severity || 'Warning',
        isActive: true,
        createdAt: new Date(),
      };

      mockStore.weatherAlerts.unshift(newAlert);
      return res.status(201).json({
        success: true,
        message: 'Weather & pest advisory broadcasted to farmers',
        data: newAlert,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dismiss or delete weather alert
// @route   DELETE /api/weather/alerts/:id
// @access  Private / Admin
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      await WeatherAlert.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Alert dismissed' });
    } else {
      mockStore.weatherAlerts = mockStore.weatherAlerts.filter(
        (a) => a._id.toString() !== id.toString()
      );
      return res.json({ success: true, message: 'Alert dismissed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
