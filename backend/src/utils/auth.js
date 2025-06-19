const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthUtils {
  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   * @param {object} payload - Token payload (usually user info)
   * @returns {string} - JWT token
   */
  static generateToken(payload) {
    return jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'pump-monitoring-api'
      }
    );
  }

  /**
   * Generate user response object (without sensitive data)
   * @param {object} user - User object from database
   * @returns {object} - Sanitized user object
   */
  static sanitizeUser(user) {
    const { password_hash, ...sanitizedUser } = user.toJSON ? user.toJSON() : user;
    return sanitizedUser;
  }
}

module.exports = AuthUtils;
