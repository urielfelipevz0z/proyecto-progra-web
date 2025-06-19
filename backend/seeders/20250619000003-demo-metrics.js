'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const metricsData = [];

    // Generate sample metrics for the last 24 hours for each pump
    for (let pumpId = 1; pumpId <= 3; pumpId++) {
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Every hour for 24 hours
        
        // Generate realistic data based on pump
        let baseFlowRate, basePressure, basePowerConsumption;
        
        if (pumpId === 1) { // Main Water Pump
          baseFlowRate = 950 + Math.random() * 100; // 950-1050 L/min
          basePressure = 45 + Math.random() * 20; // 45-65 PSI
          basePowerConsumption = 14 + Math.random() * 3; // 14-17 kW
        } else if (pumpId === 2) { // Backup Pump (inactive)
          baseFlowRate = 0;
          basePressure = 0;
          basePowerConsumption = 0;
        } else { // Industrial Pump
          baseFlowRate = 1800 + Math.random() * 400; // 1800-2200 L/min
          basePressure = 80 + Math.random() * 30; // 80-110 PSI
          basePowerConsumption = 22 + Math.random() * 6; // 22-28 kW
        }

        metricsData.push({
          pump_id: pumpId,
          flow_rate: Math.round(baseFlowRate * 100) / 100,
          pressure: Math.round(basePressure * 100) / 100,
          temperature: Math.round((25 + Math.random() * 30) * 100) / 100, // 25-55°C
          power_consumption: Math.round(basePowerConsumption * 100) / 100,
          current_efficiency: Math.round((80 + Math.random() * 15) * 100) / 100, // 80-95%
          is_operating: pumpId !== 2, // Backup pump is not operating
          timestamp: timestamp,
          created_at: timestamp,
          updated_at: timestamp
        });
      }
    }

    await queryInterface.bulkInsert('pump_metrics', metricsData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pump_metrics', null, {});
  }
};
