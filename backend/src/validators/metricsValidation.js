const { body, param, query } = require('express-validator');

const updateMetricsValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Pump ID must be a positive integer'),
  
  body('flow_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Flow rate must be a positive number'),
  
  body('pressure')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Pressure must be a positive number'),
  
  body('temperature')
    .optional()
    .isFloat({ min: -50, max: 200 })
    .withMessage('Temperature must be between -50 and 200 degrees'),
  
  body('power_consumption')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Power consumption must be a positive number'),
  
  body('current_efficiency')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Current efficiency must be between 0 and 100'),
  
  body('is_operating')
    .optional()
    .isBoolean()
    .withMessage('Is operating must be a boolean value')
];

const metricsHistoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Pump ID must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('hours')
    .optional()
    .isInt({ min: 1, max: 8760 }) // Max 1 year
    .withMessage('Hours must be between 1 and 8760 (1 year)')
];

const pumpIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Pump ID must be a positive integer')
];

module.exports = {
  updateMetricsValidation,
  metricsHistoryValidation,
  pumpIdValidation
};
