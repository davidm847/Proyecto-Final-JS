const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  day_of_week: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  max_appointments: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 50
    }
  }
}, {
  tableName: 'doctor_availability',
  indexes: [
    {
      unique: true,
      fields: ['doctor_id', 'day_of_week', 'start_time']
    }
  ]
});

module.exports = DoctorAvailability;
