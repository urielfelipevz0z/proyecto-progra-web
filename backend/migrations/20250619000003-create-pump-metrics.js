'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pump_metrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pump_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pumps',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      flow_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      pressure: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      power_consumption: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      current_efficiency: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      is_operating: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('pump_metrics', ['pump_id'], {
      name: 'pump_metrics_pump_id_idx'
    });

    await queryInterface.addIndex('pump_metrics', ['timestamp'], {
      name: 'pump_metrics_timestamp_idx'
    });

    await queryInterface.addIndex('pump_metrics', ['pump_id', 'timestamp'], {
      name: 'pump_metrics_pump_id_timestamp_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pump_metrics');
  }
};
