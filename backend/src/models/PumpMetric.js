const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const PumpMetric = sequelize.define('PumpMetric', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pump_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pumps',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  flow_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  pressure: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  power_consumption: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  current_efficiency: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  is_operating: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pump_metrics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['pump_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['pump_id', 'timestamp']
    }
  ]
});

module.exports = PumpMetric;
