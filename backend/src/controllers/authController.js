const AuthService = require('../services/authService');
const Logger = require('../utils/logger');

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { username, email, password, name } = req.body;
      
      const result = await AuthService.register({
        username,
        email,
        password,
        name
      });

      Logger.info('User registered successfully', { 
        userId: result.user.id, 
        username: result.user.username 
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      Logger.error('Registration failed', { 
        error: error.message,
        requestData: { username: req.body.username, email: req.body.email }
      });
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      const result = await AuthService.login({
        username,
        password
      });

      Logger.info('User logged in successfully', { 
        userId: result.user.id, 
        username: result.user.username 
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      Logger.error('Login failed', { 
        error: error.message,
        username: req.body.username
      });
      next(error);
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user
        }
      });
    } catch (error) {
      Logger.error('Get profile failed', { 
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  static async logout(req, res, next) {
    try {
      Logger.info('User logged out', { userId: req.user.id });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      Logger.error('Logout failed', { 
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  /**
   * Verify token (for frontend route protection)
   */
  static async verifyToken(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      Logger.error('Token verification failed', { 
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
}

module.exports = AuthController;
