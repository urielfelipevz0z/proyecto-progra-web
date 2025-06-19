'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pumps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance', 'error'),
        defaultValue: 'active'
      },
      capacity: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      manufacturer: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      installation_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      power_rating: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      voltage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      current: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_pressure: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      min_pressure: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      efficiency: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      maintenance_interval: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      last_maintenance: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('pumps', ['user_id'], {
      name: 'pumps_user_id_idx'
    });

    await queryInterface.addIndex('pumps', ['status'], {
      name: 'pumps_status_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pumps');
  }
};
