const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Pump = sequelize.define('Pump', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
    defaultValue: 'active'
  },
  // Technical specifications from your frontend
  capacity: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  installation_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  power_rating: {
    type: DataTypes.DECIMAL(10, 2), // in kW
    allowNull: true
  },
  voltage: {
    type: DataTypes.DECIMAL(10, 2), // in V
    allowNull: true
  },
  current: {
    type: DataTypes.DECIMAL(10, 2), // in A
    allowNull: true
  },
  max_pressure: {
    type: DataTypes.DECIMAL(10, 2), // in PSI
    allowNull: true
  },
  min_pressure: {
    type: DataTypes.DECIMAL(10, 2), // in PSI
    allowNull: true
  },
  efficiency: {
    type: DataTypes.DECIMAL(5, 2), // in %
    allowNull: true
  },
  maintenance_interval: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  },
  last_maintenance: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pumps',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Pump;
