const { PumpMetric, Pump } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { Op } = require('sequelize');

class MetricsService {
  /**
   * Get current metrics for a pump
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Latest metrics
   */
  static async getCurrentMetrics(pumpId, userId) {
    // First verify pump belongs to user
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    // Get latest metrics
    const metrics = await PumpMetric.findOne({
      where: { pump_id: pumpId },
      order: [['timestamp', 'DESC']]
    });

    return metrics || this.getDefaultMetrics(pumpId);
  }

  /**
   * Get metrics history for a pump
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @param {object} options - Query options (limit, hours)
   * @returns {Promise<Array>} - Array of metrics
   */
  static async getMetricsHistory(pumpId, userId, options = {}) {
    // First verify pump belongs to user
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    const { limit = 50, hours = 24 } = options;
    
    // Calculate time range
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

    const metrics = await PumpMetric.findAll({
      where: { 
        pump_id: pumpId,
        timestamp: {
          [Op.between]: [startTime, endTime]
        }
      },
      order: [['timestamp', 'DESC']],
      limit
    });

    return metrics;
  }

  /**
   * Update/Create metrics for a pump
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @param {object} metricsData - Metrics data
   * @returns {Promise<object>} - Created/Updated metrics
   */
  static async updateMetrics(pumpId, userId, metricsData) {
    // First verify pump belongs to user
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    // Create new metrics entry
    const metrics = await PumpMetric.create({
      pump_id: pumpId,
      ...metricsData,
      timestamp: new Date()
    });

    // Update pump status based on metrics
    let status = 'active';
    if (!metricsData.is_operating) {
      status = 'inactive';
    } else if (metricsData.temperature > 80 || metricsData.pressure < pump.min_pressure) {
      status = 'error';
    }

    await pump.update({ status });

    return metrics;
  }

  /**
   * Generate simulated metrics for testing
   * @param {number} pumpId - Pump ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Generated metrics
   */
  static async generateSimulatedMetrics(pumpId, userId) {
    // Get pump details for realistic simulation
    const pump = await Pump.findOne({
      where: { 
        id: pumpId,
        user_id: userId 
      }
    });

    if (!pump) {
      throw new NotFoundError('Pump not found');
    }

    // Generate realistic random values
    const simulatedData = {
      flow_rate: this.randomInRange(50, 200), // L/min
      pressure: this.randomInRange(pump.min_pressure || 30, pump.max_pressure || 100), // PSI
      temperature: this.randomInRange(20, 75), // Celsius
      power_consumption: this.randomInRange(5, pump.power_rating || 15), // kW
      current_efficiency: this.randomInRange(75, 95), // %
      is_operating: Math.random() > 0.1 // 90% chance of operating
    };

    return await this.updateMetrics(pumpId, userId, simulatedData);
  }

  /**
   * Get default metrics object
   */
  static getDefaultMetrics(pumpId) {
    return {
      pump_id: pumpId,
      flow_rate: 0,
      pressure: 0,
      temperature: 20,
      power_consumption: 0,
      current_efficiency: 0,
      is_operating: false,
      timestamp: new Date()
    };
  }

  /**
   * Generate random number in range
   */
  static randomInRange(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }
}

module.exports = MetricsService;
