const express = require('express');
const router = express.Router();
const {
  getWeather,
  getAlerts,
  createAlert,
  deleteAlert,
} = require('../controllers/weatherController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getWeather);
router.get('/alerts', getAlerts);
router.post('/alerts', protect, adminOnly, createAlert);
router.delete('/alerts/:id', protect, adminOnly, deleteAlert);

module.exports = router;
