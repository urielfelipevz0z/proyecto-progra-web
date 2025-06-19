const express = require('express');
const router = express.Router();

const PumpController = require('../controllers/pumpController');
const { 
  createPumpValidation, 
  updatePumpValidation, 
  pumpIdValidation 
} = require('../validators/pumpValidation');
const handleValidationErrors = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// All pump routes require authentication
router.use(authenticateToken);

// Pump CRUD routes
router.get('/', PumpController.getPumps);
router.post('/', createPumpValidation, handleValidationErrors, PumpController.createPump);
router.get('/:id', pumpIdValidation, handleValidationErrors, PumpController.getPump);
router.put('/:id', updatePumpValidation, handleValidationErrors, PumpController.updatePump);
router.delete('/:id', pumpIdValidation, handleValidationErrors, PumpController.deletePump);

module.exports = router;
