const PumpService = require('../services/pumpService');
const Logger = require('../utils/logger');

class PumpController {
  /**
   * Get all pumps for authenticated user
   */
  static async getPumps(req, res, next) {
    try {
      const pumps = await PumpService.getUserPumps(req.user.id);

      Logger.debug('Pumps retrieved', { 
        userId: req.user.id, 
        count: pumps.length 
      });

      res.status(200).json({
        success: true,
        message: 'Pumps retrieved successfully',
        data: {
          pumps,
          count: pumps.length
        }
      });
    } catch (error) {
      Logger.error('Get pumps failed', { 
        error: error.message,
        userId: req.user.id
      });
      next(error);
    }
  }

  /**
   * Get specific pump by ID
   */
  static async getPump(req, res, next) {
    try {
      const { id } = req.params;
      const pump = await PumpService.getPumpById(parseInt(id), req.user.id);

      Logger.debug('Pump retrieved', { 
        userId: req.user.id, 
        pumpId: id 
      });

      res.status(200).json({
        success: true,
        message: 'Pump retrieved successfully',
        data: {
          pump
        }
      });
    } catch (error) {
      Logger.error('Get pump failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id
      });
      next(error);
    }
  }

  /**
   * Create new pump
   */
  static async createPump(req, res, next) {
    try {
      const pumpData = req.body;
      const pump = await PumpService.createPump(pumpData, req.user.id);

      Logger.info('Pump created', { 
        userId: req.user.id, 
        pumpId: pump.id,
        pumpName: pump.name
      });

      res.status(201).json({
        success: true,
        message: 'Pump created successfully',
        data: {
          pump
        }
      });
    } catch (error) {
      Logger.error('Create pump failed', { 
        error: error.message,
        userId: req.user.id,
        pumpData: req.body
      });
      next(error);
    }
  }

  /**
   * Update pump
   */
  static async updatePump(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const pump = await PumpService.updatePump(parseInt(id), updateData, req.user.id);

      Logger.info('Pump updated', { 
        userId: req.user.id, 
        pumpId: id,
        updateData
      });

      res.status(200).json({
        success: true,
        message: 'Pump updated successfully',
        data: {
          pump
        }
      });
    } catch (error) {
      Logger.error('Update pump failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id,
        updateData: req.body
      });
      next(error);
    }
  }

  /**
   * Delete pump
   */
  static async deletePump(req, res, next) {
    try {
      const { id } = req.params;
      await PumpService.deletePump(parseInt(id), req.user.id);

      Logger.info('Pump deleted', { 
        userId: req.user.id, 
        pumpId: id
      });

      res.status(200).json({
        success: true,
        message: 'Pump deleted successfully'
      });
    } catch (error) {
      Logger.error('Delete pump failed', { 
        error: error.message,
        userId: req.user.id,
        pumpId: req.params.id
      });
      next(error);
    }
  }
}

module.exports = PumpController;
