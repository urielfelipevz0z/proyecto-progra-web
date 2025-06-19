const MetricsService = require('../services/metricsService');
const Logger = require('../utils/logger');

class MetricsController {
  /**
   * Get current metrics for a pump
   */
  static async getCurrentMetrics(req, res, next) {
    try {
      const { id } = req.params;
      const metrics = await MetricsService.getCurrentMetrics(parseInt(id), req.user.id);

      Logger.debug('Current metrics retrieved', { 
        userId: req.user.id, 
        pumpId: id 
      });

      res.status(200).json({
        success: true,
        message: 'Current metrics retrieved successfully',
        data: {
          metrics
        }
      });
    } catch (error) {
      Logger.error('Get current metrics failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id
      });
      next(error);
    }
  }

  /**
   * Get metrics history for a pump
   */
  static async getMetricsHistory(req, res, next) {
    try {
      const { id } = req.params;
      const { limit, hours } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (hours) options.hours = parseInt(hours);

      const metrics = await MetricsService.getMetricsHistory(parseInt(id), req.user.id, options);

      Logger.debug('Metrics history retrieved', { 
        userId: req.user.id, 
        pumpId: id,
        count: metrics.length,
        options
      });

      res.status(200).json({
        success: true,
        message: 'Metrics history retrieved successfully',
        data: {
          metrics,
          count: metrics.length
        }
      });
    } catch (error) {
      Logger.error('Get metrics history failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id
      });
      next(error);
    }
  }

  /**
   * Update metrics for a pump
   */
  static async updateMetrics(req, res, next) {
    try {
      const { id } = req.params;
      const metricsData = req.body;
      
      const metrics = await MetricsService.updateMetrics(parseInt(id), req.user.id, metricsData);

      Logger.info('Metrics updated', { 
        userId: req.user.id, 
        pumpId: id,
        metricsData
      });

      res.status(200).json({
        success: true,
        message: 'Metrics updated successfully',
        data: {
          metrics
        }
      });
    } catch (error) {
      Logger.error('Update metrics failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id,
        metricsData: req.body
      });
      next(error);
    }
  }

  /**
   * Generate simulated metrics for testing
   */
  static async simulateMetrics(req, res, next) {
    try {
      const { id } = req.params;
      const metrics = await MetricsService.generateSimulatedMetrics(parseInt(id), req.user.id);

      Logger.info('Simulated metrics generated', { 
        userId: req.user.id, 
        pumpId: id
      });

      res.status(200).json({
        success: true,
        message: 'Simulated metrics generated successfully',
        data: {
          metrics
        }
      });
    } catch (error) {
      Logger.error('Simulate metrics failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id
      });
      next(error);
    }
  }
}

module.exports = MetricsController;
