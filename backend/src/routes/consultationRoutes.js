const express = require('express');
const router = express.Router();
const { getConsultations, createConsultation } = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getConsultations)
  .post(createConsultation);

module.exports = router;
