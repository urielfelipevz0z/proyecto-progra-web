'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('pumps', [
      {
        user_id: 1, // testuser
        name: 'Main Water Pump',
        location: 'Building A - Basement',
        status: 'active',
        capacity: '1000 L/min',
        model: 'WP-1000X',
        manufacturer: 'AquaTech',
        installation_date: new Date('2023-01-15'),
        power_rating: 15.5,
        voltage: 220,
        current: 70.5,
        max_pressure: 80,
        min_pressure: 20,
        efficiency: 88.5,
        maintenance_interval: 90,
        last_maintenance: new Date('2024-10-15'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 1, // testuser
        name: 'Backup Pump',
        location: 'Building A - Basement',
        status: 'inactive',
        capacity: '800 L/min',
        model: 'WP-800',
        manufacturer: 'AquaTech',
        installation_date: new Date('2023-03-20'),
        power_rating: 12.0,
        voltage: 220,
        current: 55.0,
        max_pressure: 75,
        min_pressure: 15,
        efficiency: 85.0,
        maintenance_interval: 120,
        last_maintenance: new Date('2024-09-20'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // admin
        name: 'Industrial Pump #1',
        location: 'Factory Floor - Section B',
        status: 'active',
        capacity: '2000 L/min',
        model: 'IP-2000',
        manufacturer: 'IndustrialFlow',
        installation_date: new Date('2022-08-10'),
        power_rating: 25.0,
        voltage: 380,
        current: 65.8,
        max_pressure: 120,
        min_pressure: 30,
        efficiency: 92.0,
        maintenance_interval: 60,
        last_maintenance: new Date('2024-11-01'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pumps', null, {});
  }
};
