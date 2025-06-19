const sequelize = require('./database');
const User = require('./User');
const Pump = require('./Pump');
const PumpMetric = require('./PumpMetric');

// Define associations
User.hasMany(Pump, {
  foreignKey: 'user_id',
  as: 'pumps',
  onDelete: 'CASCADE'
});

Pump.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Pump.hasMany(PumpMetric, {
  foreignKey: 'pump_id',
  as: 'metrics',
  onDelete: 'CASCADE'
});

PumpMetric.belongsTo(Pump, {
  foreignKey: 'pump_id',
  as: 'pump'
});

module.exports = {
  sequelize,
  User,
  Pump,
  PumpMetric
};
