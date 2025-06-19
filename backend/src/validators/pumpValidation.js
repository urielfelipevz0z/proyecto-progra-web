const { body, param } = require('express-validator');

const createPumpValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Pump name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Pump name must be between 1 and 100 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('capacity')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Capacity must not exceed 50 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must not exceed 100 characters'),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Manufacturer must not exceed 100 characters'),
  
  body('installationDate')
    .optional()
    .isISO8601()
    .withMessage('Installation date must be a valid date'),
  
  body('powerRating')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Power rating must be a positive number'),
  
  body('voltage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Voltage must be a positive number'),
  
  body('current')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current must be a positive number'),
  
  body('maxPressure')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max pressure must be a positive number'),
  
  body('minPressure')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min pressure must be a positive number'),
  
  body('efficiency')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Efficiency must be between 0 and 100'),
  
  body('maintenanceInterval')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maintenance interval must be a positive integer'),
  
  body('lastMaintenance')
    .optional()
    .isISO8601()
    .withMessage('Last maintenance date must be a valid date')
];

const updatePumpValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Pump ID must be a positive integer'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pump name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Pump name must be between 1 and 100 characters'),
  
  // Same validations as create, but all optional
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'error'])
    .withMessage('Status must be active, inactive, maintenance, or error'),
  
  body('capacity')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Capacity must not exceed 50 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must not exceed 100 characters'),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Manufacturer must not exceed 100 characters'),
  
  body('installationDate')
    .optional()
    .isISO8601()
    .withMessage('Installation date must be a valid date'),
  
  body('powerRating')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Power rating must be a positive number'),
  
  body('voltage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Voltage must be a positive number'),
  
  body('current')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current must be a positive number'),
  
  body('maxPressure')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max pressure must be a positive number'),
  
  body('minPressure')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min pressure must be a positive number'),
  
  body('efficiency')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Efficiency must be between 0 and 100'),
  
  body('maintenanceInterval')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maintenance interval must be a positive integer'),
  
  body('lastMaintenance')
    .optional()
    .isISO8601()
    .withMessage('Last maintenance date must be a valid date')
];

const pumpIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Pump ID must be a positive integer')
];

module.exports = {
  createPumpValidation,
  updatePumpValidation,
  pumpIdValidation
};
