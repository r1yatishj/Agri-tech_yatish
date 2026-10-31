// Soil Health Diagnostic and Prescriptions based on ICAR & Agronomic Standards

exports.analyzeSoil = async (req, res) => {
  try {
    const {
      ph = 6.8,
      moisture = 45,
      nitrogen = 280,
      phosphorus = 22,
      potassium = 190,
      organicCarbon = 0.75,
      targetCrop = 'Wheat'
    } = req.body;

    const numPh = parseFloat(ph) || 6.8;
    const numMoisture = parseFloat(moisture) || 45;
    const numN = parseFloat(nitrogen) || 280;
    const numP = parseFloat(phosphorus) || 22;
    const numK = parseFloat(potassium) || 190;
    const numOC = parseFloat(organicCarbon) || 0.75;

    // Component Score calculations (0 to 100 each)
    // 1. pH Score: optimal 6.2 - 7.5
    let phScore = 100 - Math.min(100, Math.abs(numPh - 6.8) * 35);
    // 2. Moisture Score: optimal 40% - 60%
    let moistureScore = numMoisture >= 40 && numMoisture <= 60 
      ? 100 
      : 100 - Math.min(100, Math.abs(numMoisture - 50) * 2.2);
    // 3. Nitrogen Score: optimal 280 - 450 kg/ha
    let nScore = numN >= 280 && numN <= 450 
      ? 100 
      : numN < 280 
        ? Math.max(30, (numN / 280) * 100) 
        : Math.max(40, 100 - (numN - 450) * 0.3);
    // 4. Phosphorus Score: optimal 20 - 35 kg/ha
    let pScore = numP >= 20 && numP <= 35 
      ? 100 
      : numP < 20 
        ? Math.max(30, (numP / 20) * 100) 
        : Math.max(50, 100 - (numP - 35) * 2);
    // 5. Potassium Score: optimal 180 - 280 kg/ha
    let kScore = numK >= 180 && numK <= 280 
      ? 100 
      : numK < 180 
        ? Math.max(30, (numK / 180) * 100) 
        : Math.max(50, 100 - (numK - 280) * 0.4);
    // 6. Organic Carbon Score: optimal >= 0.75%
    let ocScore = numOC >= 0.75 
      ? 100 
      : Math.max(30, (numOC / 0.75) * 100);

    const weightedScore = Math.round(
      phScore * 0.20 +
      moistureScore * 0.15 +
      nScore * 0.25 +
      pScore * 0.15 +
      kScore * 0.15 +
      ocScore * 0.10
    );

    let rating = 'Optimal / Prime Fertility';
    if (weightedScore < 50) {
      rating = 'Critically Degraded / Severe Deficit';
    } else if (weightedScore < 70) {
      rating = 'Moderate / Requires Nutrient Boost';
    } else if (weightedScore < 85) {
      rating = 'Good / Balanced Fertility';
    }

    // Dynamic Recommendations
    const recommendations = [];

    // Nitrogen
    if (numN < 250) {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: `Deficient (${numN} kg/ha)`,
        action: 'Apply split doses of neem-coated urea or enriched vermicompost (50 kg/acre) at vegetative peak.'
      });
    } else if (numN > 500) {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: `Excessive (${numN} kg/ha)`,
        action: 'Withhold synthetic urea to prevent stem lodging, vegetative overgrowth, and elevated pest risk.'
      });
    } else {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: `Optimal (${numN} kg/ha)`,
        action: 'Soil nitrogen levels are well within the ICAR benchmark. Maintain current organic mulching regimen.'
      });
    }

    // Phosphorus
    if (numP < 20) {
      recommendations.push({
        nutrient: 'Phosphorus (P)',
        status: `Low (${numP} kg/ha)`,
        action: 'Incorporate Single Super Phosphate (SSP) or rock phosphate as basal dressing to stimulate root tillering.'
      });
    } else {
      recommendations.push({
        nutrient: 'Phosphorus (P)',
        status: `Adequate (${numP} kg/ha)`,
        action: 'Adequate available P reserves detected; maintain mycorrhizal bio-fertilizer seed treatment.'
      });
    }

    // Potassium
    if (numK < 160) {
      recommendations.push({
        nutrient: 'Potassium (K)',
        status: `Deficient (${numK} kg/ha)`,
        action: 'Broadcast Muriate of Potash (MOP @ 25 kg/acre) or spray 1% Sulphate of Potash to enhance disease resistance.'
      });
    } else {
      recommendations.push({
        nutrient: 'Potassium (K)',
        status: `Optimal (${numK} kg/ha)`,
        action: 'Healthy potassium buffering capacity; supports vigorous cellular wall strength and grain filling.'
      });
    }

    // Soil pH
    if (numPh < 6.0) {
      recommendations.push({
        nutrient: 'Soil pH',
        status: `Acidic (${numPh})`,
        action: 'Broadcast agricultural dolomite lime @ 200 kg/acre 3 weeks before seed sowing to neutralize soil acidity.'
      });
    } else if (numPh > 7.8) {
      recommendations.push({
        nutrient: 'Soil pH',
        status: `Alkaline (${numPh})`,
        action: 'Apply agricultural gypsum @ 150 kg/acre and incorporate green manure crops (Dhaincha/Sesbania) to reduce alkalinity.'
      });
    } else {
      recommendations.push({
        nutrient: 'Soil pH',
        status: `Balanced / Neutral (${numPh})`,
        action: 'Ideal biochemical bioavailability window for macro and micro-nutrients across major cereal and pulse crops.'
      });
    }

    // Organic Carbon
    if (numOC < 0.5) {
      recommendations.push({
        nutrient: 'Organic Carbon',
        status: `Low (${numOC}%)`,
        action: 'Incorporate well-composted farmyard manure (FYM @ 3 tonnes/acre) and adopt no-till residues management.'
      });
    } else {
      recommendations.push({
        nutrient: 'Organic Carbon',
        status: `Good (${numOC}%)`,
        action: 'High microbiological organic humus. Continue rotating legume crops with cereals.'
      });
    }

    // Dynamic Amendments
    const amendments = [
      numPh > 7.8 
        ? 'Broadcast Agricultural Gypsum (150 kg/acre) to mitigate sodicity.' 
        : numPh < 6.0 
        ? 'Apply Calcified Agricultural Lime (200 kg/acre) to restore base saturation.'
        : 'Broadcast 2.5 tonnes/acre of well-rotted Farmyard Manure (FYM) before next tillage.',
      'Treat seed lots with Trichoderma viride and Rhizobium/Azotobacter bio-culture slurry before planting.',
      'Maintain 5-7 cm organic crop residue mulch to preserve rhizosphere microbial moisture.'
    ];

    // Crop Suitability Recommendation
    const suggestedCrops = [];
    if (numPh >= 6.0 && numPh <= 7.5) {
      suggestedCrops.push('Basmati Rice (Pusa 1121)', 'Sharbati Wheat', 'Yellow Mustard', 'Chickpea (Chana)', 'Soybean');
    } else if (numPh > 7.5) {
      suggestedCrops.push('Barley', 'Cotton', 'Guar', 'Sugarbeet', 'Mustard');
    } else {
      suggestedCrops.push('Maize', 'Millets (Bajra)', 'Groundnut', 'Potato');
    }

    if (targetCrop && !suggestedCrops.includes(targetCrop)) {
      suggestedCrops.unshift(targetCrop);
    }

    return res.json({
      success: true,
      data: {
        score: weightedScore,
        rating,
        recommendations,
        amendments,
        suggestedCrops
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
