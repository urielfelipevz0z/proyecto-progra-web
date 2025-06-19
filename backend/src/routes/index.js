const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const pumpRoutes = require('./pumps');
const metricsRoutes = require('./metrics');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/pumps', pumpRoutes);
router.use('/metrics', metricsRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;
