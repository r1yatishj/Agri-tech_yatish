const mongoose = require('mongoose');
const WeatherAlert = require('../models/WeatherAlert');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get live microclimate weather & 7-day forecast
// @route   GET /api/weather and GET /api/weather/forecast
// @access  Public / Private
exports.getWeather = async (req, res) => {
  try {
    const region = req.query.region || 'Kota Agrarian Belt';

    const activePest = mockStore.activePestAlert || {
      alertActive: true,
      riskLevel: 'High',
      pestName: 'Fall Armyworm (Spodoptera frugiperda)',
      scientificName: 'Spodoptera frugiperda (J.E. Smith)',
      affectedCrops: ['Basmati Rice', 'Maize', 'Yellow Mustard'],
      symptoms: 'Irregular ragged pinholes and skeletonized leaves with moist sawdust-like larval frass in leaf whorls.',
      recommendedTreatment: {
        organic: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Bacillus thuringiensis (Bt var. kurstaki) @ 2g/L water during early morning.',
        chemical: 'Targeted application of Emamectin Benzoate 5% SG @ 0.4g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L directly into leaf whorls.'
      }
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();

    const forecast = [];
    const forecastConditions = ['Sunny', 'Partly Cloudy', 'Scattered Showers', 'Overcast', 'Clear Sky', 'Sunny', 'Light Rain'];
    const rainChances = [10, 40, 65, 30, 5, 10, 50];
    const maxTemps = [33, 34, 31, 32, 35, 34, 30];
    const minTemps = [22, 23, 21, 20, 23, 22, 21];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()].substring(0, 3);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      forecast.push({
        day: dayName,
        date: dateStr,
        maxTemp: maxTemps[i],
        minTemp: minTemps[i],
        tempMax: maxTemps[i],
        tempMin: minTemps[i],
        rainChance: rainChances[i],
        rainfallProbability: rainChances[i],
        condition: forecastConditions[i]
      });
    }

    const payload = {
      location: {
        district: 'Kota',
        state: 'Rajasthan',
        region: region,
      },
      region,
      currentWeather: {
        temperature: 31,
        temperatureC: 31,
        feelsLikeC: 34,
        condition: 'Partly Cloudy',
        humidity: 68,
        humidityPercent: 68,
        windSpeed: 14,
        windSpeedKmh: 14,
        windDirection: 'North-West (NW)',
        rainfallProbability: 25,
        rainProbabilityPercent: 25,
        uvIndex: 6,
        barometricPressureHpa: 1012,
        evapotranspirationRate: '4.2 mm/day',
        irrigationAdvisory: 'Moderate soil moisture loss. Optimal watering window: 05:30 AM - 08:30 AM or post-sunset.',
        pestVulnerabilityStatus: 'Elevated fungal and sucking pest risk due to moderate humidity.',
      },
      forecast,
      pestAlert: activePest,
    };

    return res.json({ success: true, data: payload });
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
      windSpeed,
      pestRiskLevel,
      advisoryMessage,
      identifiedThreat,
      recommendedAction,
      affectedCrops,
      severity,
    } = req.body;

    const cropsList = Array.isArray(affectedCrops)
      ? affectedCrops
      : typeof affectedCrops === 'string'
      ? affectedCrops.split(',').map((c) => c.trim()).filter(Boolean)
      : ['General Crops'];

    if (isDBConnected()) {
      const alert = await WeatherAlert.create({
        region: region || 'Agrarian Network',
        temperature: Number(temperature) || 30,
        humidity: Number(humidity) || 75,
        windSpeed: Number(windSpeed) || 15,
        pestRiskLevel: pestRiskLevel || 'High',
        advisoryMessage: advisoryMessage || 'Agricultural weather alert active.',
        identifiedThreat: identifiedThreat || 'Pest Threat',
        recommendedAction: recommendedAction || 'Apply recommended countermeasures.',
        affectedCrops: cropsList,
        severity: severity || 'Warning',
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Weather and pest advisory broadcasted successfully',
        data: alert,
      });
    } else {
      const newAlert = {
        _id: 'alert_' + Date.now(),
        region: region || 'Agrarian Network',
        temperature: Number(temperature) || 30,
        humidity: Number(humidity) || 75,
        windSpeed: Number(windSpeed) || 15,
        pestRiskLevel: pestRiskLevel || 'High',
        advisoryMessage: advisoryMessage || 'Agricultural weather alert active.',
        identifiedThreat: identifiedThreat || 'Pest Threat',
        recommendedAction: recommendedAction || 'Apply recommended countermeasures.',
        affectedCrops: cropsList,
        severity: severity || 'Warning',
        isActive: true,
        createdAt: new Date(),
      };

      mockStore.weatherAlerts.unshift(newAlert);
      return res.status(201).json({
        success: true,
        message: 'Weather and pest advisory broadcasted successfully',
        data: newAlert,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete / Dismiss alert
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
