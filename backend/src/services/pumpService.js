const { Pump, PumpMetric } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

class PumpService {
  /**
   * Get all pumps for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of pumps
   */
  static async getUserPumps(userId) {
    const pumps = await Pump.findAll({
      where: { user_id: userId },
      include: [{
        model: PumpMetric,
        as: 'metrics',
        limit: 1,
        order: [['timestamp', 'DESC']],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    return pumps;
  }

  /**
   * Get a specific pump by ID
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Pump object
   */
  static async getPumpById(pumpId, userId) {
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      },
      include: [{
        model: PumpMetric,
        as: 'metrics',
        limit: 1,
        order: [['timestamp', 'DESC']],
        required: false
      }]
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    return pump;
  }

  /**
   * Create a new pump
   * @param {object} pumpData - Pump data
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Created pump
   */
  static async createPump(pumpData, userId) {
    const pump = await Pump.create({
      ...pumpData,
      user_id: userId
    });

    // Create initial metrics with zero values
    await PumpMetric.create({
      pump_id: pump.id,
      flow_rate: 0,
      pressure: 0,
      temperature: 0,
      power_consumption: 0,
      current_efficiency: 0,
      is_operating: false,
      timestamp: new Date()
    });

    // Fetch pump with initial metrics
    return await this.getPumpById(pump.id, userId);
  }

  /**
   * Update a pump
   * @param {number} pumpId - Pump ID
   * @param {object} updateData - Data to update
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Updated pump
   */
  static async updatePump(pumpId, updateData, userId) {
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    await pump.update(updateData);
    
    return await this.getPumpById(pumpId, userId);
  }

  /**
   * Delete a pump
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async deletePump(pumpId, userId) {
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    await pump.destroy();
  }
}

module.exports = PumpService;
