require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Product = require('../models/Product');
const Order = require('../models/Order');
const WeatherAlert = require('../models/WeatherAlert');
const ForumPost = require('../models/ForumPost');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully for seeding.');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Farm.deleteMany(),
      Crop.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      WeatherAlert.deleteMany(),
      ForumPost.deleteMany(),
    ]);
    console.log('Cleared existing collections.');

    // Seed Users
    const adminUser = await User.create({
      name: 'Yatish Jangid (Principal Agronomist)',
      email: 'admin@agritech.com',
      password: 'Admin@123',
      role: 'admin',
      language: 'en',
      phone: '+91 98765 43210',
      location: 'Jaipur, Rajasthan',
    });

    const farmerUser = await User.create({
      name: 'Ramesh Kumar (Kisan Mitra)',
      email: 'farmer@agritech.com',
      password: 'Farmer@123',
      role: 'farmer',
      language: 'en',
      phone: '+91 98234 56789',
      location: 'Kota, Rajasthan',
    });
    console.log('Users created: Admin (admin@agritech.com) & Farmer (farmer@agritech.com)');

    // Seed Farms
    const farm1 = await Farm.create({
      farmerId: farmerUser._id,
      name: 'Surya Green Valley Farm',
      location: 'Village Sultanpur, Kota, Rajasthan',
      sizeAcres: 8.5,
      soilType: 'Loamy',
      cropsGrown: ['Basmati Rice', 'Mustard', 'Wheat'],
      irrigationType: 'Drip Irrigation',
      soilHealthSummary: {
        lastTested: new Date(),
        averagePH: 6.8,
        averageMoisture: 48,
        healthGrade: 'Optimal',
      },
    });

    const farm2 = await Farm.create({
      farmerId: farmerUser._id,
      name: 'Kaveri Organic Orchards',
      location: 'Chambal Catchment, Bundi, Rajasthan',
      sizeAcres: 4.2,
      soilType: 'Black Soil',
      cropsGrown: ['Cotton', 'Pomegranate', 'Chickpea'],
      irrigationType: 'Sprinkler',
      soilHealthSummary: {
        lastTested: new Date(),
        averagePH: 7.2,
        averageMoisture: 42,
        healthGrade: 'Good',
      },
    });
    console.log('Farms seeded.');

    // Seed Crops
    await Crop.create([
      {
        farmId: farm1._id,
        farmerId: farmerUser._id,
        cropName: 'Basmati Rice (Pusa 1121)',
        variety: 'Aromatic Long Grain',
        plantingDate: new Date('2026-06-20'),
        expectedHarvestDate: new Date('2026-11-15'),
        healthStatus: 'Healthy',
        stages: { currentStage: 'Flowering', stageProgressPercent: 68 },
        soilHealth: {
          nitrogen: 155,
          phosphorus: 42,
          potassium: 220,
          moisture: 58,
          ph: 6.7,
          temperatureC: 26,
          lastTested: new Date(),
          aiRecommendation: 'Optimal vegetative parameters. Soil nitrogen and moisture in prime range.',
        },
        notes: 'Bio-stimulant applied on day 40. High tillering density.',
      },
      {
        farmId: farm1._id,
        farmerId: farmerUser._id,
        cropName: 'Yellow Mustard (Pusa Bold)',
        variety: 'Drought Tolerant Hybrid',
        plantingDate: new Date('2026-10-05'),
        expectedHarvestDate: new Date('2027-02-25'),
        healthStatus: 'Good',
        stages: { currentStage: 'Vegetative', stageProgressPercent: 30 },
        soilHealth: {
          nitrogen: 135,
          phosphorus: 38,
          potassium: 195,
          moisture: 42,
          ph: 7.1,
          temperatureC: 22,
          lastTested: new Date(),
          aiRecommendation: 'Phosphorus level is healthy for root growth.',
        },
        notes: 'Germination rate at 94%. Zero pest signs detected.',
      },
      {
        farmId: farm2._id,
        farmerId: farmerUser._id,
        cropName: 'Bt Cotton (Bollgard II)',
        variety: 'Long Staple',
        plantingDate: new Date('2026-05-15'),
        expectedHarvestDate: new Date('2026-11-30'),
        healthStatus: 'Attention Needed',
        stages: { currentStage: 'Yield Formation', stageProgressPercent: 78 },
        soilHealth: {
          nitrogen: 110,
          phosphorus: 28,
          potassium: 160,
          moisture: 36,
          ph: 7.4,
          temperatureC: 28,
          lastTested: new Date(),
          aiRecommendation: 'Moisture drop detected. Supplementary drip irrigation recommended within 48h.',
        },
        notes: 'Slight whitefly presence on lower canopy. Neem oil sprayed.',
      },
    ]);
    console.log('Crops seeded.');

    // Seed Products
    const products = await Product.create([
      {
        name: 'Pusa Gold Hybrid Wheat Seeds',
        category: 'Seeds',
        price: 850,
        unit: '20 kg bag',
        description: 'High-yielding, rust-resistant certified wheat seed variety with 48 quintal/hectare potential yield.',
        stock: 85,
        rating: 4.9,
        reviewCount: 38,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        badge: 'Bestseller',
      },
      {
        name: 'Organic Jeevamrit Bio-Fertilizer Concentrate',
        category: 'Bio-Fertilizers',
        price: 620,
        unit: '5 Litre can',
        description: 'Fermented microbial consortium rich in beneficial soil flora. Boosts nutrient uptake.',
        stock: 120,
        rating: 4.8,
        reviewCount: 64,
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
        badge: '100% Organic',
      },
      {
        name: 'Cold-Pressed Neem Oil (10,000 PPM Azadirachtin)',
        category: 'Pest Control',
        price: 490,
        unit: '1 Litre bottle',
        description: 'Natural botanical insecticide and repellent. Controls chewing & sucking pests without residue.',
        stock: 95,
        rating: 4.7,
        reviewCount: 52,
        imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
        badge: 'Eco Safe',
      },
      {
        name: 'Precision Digital Soil NPK & pH Meter Kit',
        category: 'Irrigation & Tools',
        price: 1850,
        unit: '1 Kit (Tester + Probes)',
        description: 'Instant readout digital probe measuring Soil Moisture, pH, and electrical conductivity.',
        stock: 35,
        rating: 4.9,
        reviewCount: 41,
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        badge: 'Smart Tool',
      },
    ]);
    console.log('Products seeded.');

    // Seed Weather Alerts
    await WeatherAlert.create([
      {
        region: 'Kota & Bundi District',
        temperature: 31,
        humidity: 82,
        rainfall: 14.5,
        windSpeed: 16,
        pestRiskLevel: 'High',
        advisoryMessage: 'High humidity (>80%) combined with overcast skies creates favorable conditions for Powdery Mildew and Stem Borer.',
        identifiedThreat: 'Stem Borer & Powdery Mildew',
        recommendedAction: 'Apply Trichoderma viride or light systemic bio-fungicide within 36 hours.',
        affectedCrops: ['Basmati Rice', 'Cotton', 'Mustard'],
        severity: 'Warning',
        isActive: true,
      },
    ]);
    console.log('Weather alerts seeded.');

    // Seed Forum
    await ForumPost.create([
      {
        authorId: farmerUser._id,
        authorName: farmerUser.name,
        authorRole: 'farmer',
        title: 'Yellowing of lower leaves in Basmati rice at flowering stage: Nitrogen deficiency or root fungus?',
        content: 'I noticed that the lower leaves of my Basmati rice crop in Sultanpur are turning yellow with brown tips. Soil moisture is at 55%. Should I apply urea now or check for root rot?',
        category: 'Crop Diseases',
        upvotes: 7,
        isResolved: true,
        hasExpertResponse: true,
        responses: [
          {
            authorId: adminUser._id,
            authorName: 'Dr. Yatish Jangid (Principal Agronomist)',
            authorRole: 'admin',
            comment: 'At 68% flowering stage, top-dressing with chemical nitrogen can cause lodge and stem rot. Yellowing of bottom leaves usually indicates Potassium (K) mobilization to grain heads, or early sheath blight. Inspect the leaf collar for elliptical lesions. If lesions exist, spray Validamycin 3% L @ 2ml/L.',
            isExpertAnswer: true,
            upvotes: 11,
            createdAt: new Date(),
          },
        ],
      },
    ]);
    console.log('Forum posts seeded.');

    console.log('✅ Agri-Tech Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedDB();
