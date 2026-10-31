require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB, getDBStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const forumRoutes = require('./routes/forumRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const soilRoutes = require('./routes/soilRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// System Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    appName: 'Agri-Tech MERN Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/products', productRoutes);
app.use('/api/resources', productRoutes); // Alias used by Marketplace catalog
app.use('/api/orders', orderRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/admin', adminRoutes);

// Integrated Frontend & Backend Static Serving (Single Unified Link)
const distCandidates = [
  path.resolve(__dirname, '../../dist'),           // agritech-client/dist
  path.resolve(__dirname, '../../frontend/dist'),  // monorepo frontend/dist
  path.resolve(__dirname, '../dist')
];

const frontendBuildPath = distCandidates.find((dir) => fs.existsSync(dir));

if (frontendBuildPath) {
  console.log(`[Unified Full-Stack] Serving integrated React frontend from ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Agri-Tech API server is active',
      health: '/api/health',
      note: 'Run npm run build to integrate and serve React frontend directly from this unified link',
      endpoints: {
        auth: '/api/auth',
        farms: '/api/farms',
        crops: '/api/crops',
        weather: '/api/weather',
        products: '/api/products',
        resources: '/api/resources',
        orders: '/api/orders',
        forum: '/api/forum',
        consultations: '/api/consultations',
        soil: '/api/soil',
        admin: '/api/admin',
      },
    });
  });
}

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Agri-Tech Server] Listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = { app, server };
