const express = require('express');
const router = express.Router();
const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  updateSoilHealth,
  deleteCrop,
} = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

router.use(protect); // All crop routes protected

router.route('/')
  .get(getCrops)
  .post(createCrop);

router.route('/:id')
  .get(getCropById)
  .put(updateCrop)
  .delete(deleteCrop);

router.put('/:id/soil-health', updateSoilHealth);

module.exports = router;
