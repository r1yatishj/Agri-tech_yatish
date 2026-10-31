const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');

// Generate an intelligent agronomic diagnostic preview
const generateInstantDiagnosis = (crop, subject, symptoms, urgency) => {
  const c = (crop || '').toLowerCase();
  const s = (symptoms || '').toLowerCase();

  let diagnosis = 'Nutrient deficiency coupled with weather stress';
  let immediateAction = 'Apply balanced micronutrient foliar spray in morning hours.';
  let recommendedInputs = ['Multi-Micronutrient Chelated Mix', 'Neem Seed Extract'];
  let preventiveGuidelines = 'Maintain uniform irrigation cycle and inspect leaf undersides weekly.';

  if (s.includes('yellow') || s.includes('tip') || s.includes('pale')) {
    diagnosis = 'Nitrogen/Potassium deficit accelerated by soil moisture variation';
    immediateAction = 'Apply foliar spray of 1% Sulphate of Potash (0-0-50) @ 10g/L water.';
    recommendedInputs = ['Sulphate of Potash (SOP)', 'Azotobacter bio-culture'];
  } else if (s.includes('blister') || s.includes('rust') || s.includes('spot') || s.includes('fungal')) {
    diagnosis = 'Fungal foliar pathogen favored by high humidity microclimate';
    immediateAction = 'Spray Mancozeb 75% WP @ 2.5g/L water immediately.';
    recommendedInputs = ['Mancozeb 75 WP', 'Trichoderma viride'];
    preventiveGuidelines = 'Ensure adequate inter-row spacing to lower canopy humidity.';
  } else if (s.includes('hole') || s.includes('caterpillar') || s.includes('borer') || s.includes('pest')) {
    diagnosis = 'Lepidopteran chewing larvae / borer infestation';
    immediateAction = 'Spray Emamectin Benzoate 5% SG @ 0.4g/L in central leaf whorls.';
    recommendedInputs = ['Emamectin Benzoate 5 SG', 'Pheromone Traps (5/acre)'];
  }

  return {
    diagnosis,
    immediateAction,
    recommendedInputs,
    preventiveGuidelines
  };
};

// @desc    Get consultations
// @route   GET /api/consultations
// @access  Private
exports.getConsultations = async (req, res) => {
  try {
    const list = mockStore.consultations || [];
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book / Request a new expert consultation
// @route   POST /api/consultations
// @access  Private
exports.createConsultation = async (req, res) => {
  try {
    const {
      cropAffected,
      issueSubject,
      symptoms,
      specializationRequested,
      urgency,
    } = req.body;

    if (!cropAffected || !issueSubject || !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Crop, issue subject, and observed symptoms are required',
      });
    }

    const prescription = generateInstantDiagnosis(
      cropAffected,
      issueSubject,
      symptoms,
      urgency
    );

    const newConsultation = {
      _id: 'consult_' + Date.now(),
      farmerId: req.user._id,
      farmerName: req.user.name,
      cropAffected,
      issueSubject,
      symptoms,
      specializationRequested: specializationRequested || 'Agronomist (Soil & Crop)',
      urgency: urgency || 'Normal',
      status: 'Prescription Provided',
      createdAt: new Date(),
      assignedExpert: {
        name: 'Dr. Yatish Jangid (Senior Agronomist, ICAR Extension)',
        designation: 'Specialist in Agro-Pathology & Soil Management'
      },
      expertPrescription: prescription,
    };

    if (!mockStore.consultations) {
      mockStore.consultations = [];
    }
    mockStore.consultations.unshift(newConsultation);

    return res.status(201).json({
      success: true,
      message: 'Consultation request submitted! Extension expert diagnosis generated.',
      data: newConsultation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
