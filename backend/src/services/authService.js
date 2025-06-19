const { User } = require('../models');
const { Op } = require('sequelize');
const AuthUtils = require('../utils/auth');
const { ConflictError, UnauthorizedError, ValidationError } = require('../utils/errors');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} - User object and token
   */
  static async register(userData) {
    const { username, email, password, name } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictError('Username already exists');
      }
    }

    // Hash password
    const password_hash = await AuthUtils.hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      name
    });

    // Generate token
    const token = AuthUtils.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return {
      user: AuthUtils.sanitizeUser(user),
      token
    };
  }

  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @returns {Promise<object>} - User object and token
   */
  static async login(credentials) {
    const { username, password } = credentials;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username } // Allow login with email
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = AuthUtils.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return {
      user: AuthUtils.sanitizeUser(user),
      token
    };
  }

  /**
   * Get user profile
   * @param {number} userId - User ID
   * @returns {Promise<object>} - User object
   */
  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}

module.exports = AuthService;
