const express = require('express');
const router = express.Router();

const MetricsController = require('../controllers/metricsController');
const { 
  updateMetricsValidation, 
  metricsHistoryValidation,
  pumpIdValidation 
} = require('../validators/metricsValidation');
const handleValidationErrors = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// All metrics routes require authentication
router.use(authenticateToken);

// Metrics routes
router.get('/:id/current', pumpIdValidation, handleValidationErrors, MetricsController.getCurrentMetrics);
router.get('/:id/history', metricsHistoryValidation, handleValidationErrors, MetricsController.getMetricsHistory);
router.post('/:id/update', updateMetricsValidation, handleValidationErrors, MetricsController.updateMetrics);
router.post('/:id/simulate', pumpIdValidation, handleValidationErrors, MetricsController.simulateMetrics);

module.exports = router;
