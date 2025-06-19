const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidation');
const handleValidationErrors = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// Public routes
router.post('/register', registerValidation, handleValidationErrors, AuthController.register);
router.post('/login', loginValidation, handleValidationErrors, AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/verify', authenticateToken, AuthController.verifyToken);

module.exports = router;
