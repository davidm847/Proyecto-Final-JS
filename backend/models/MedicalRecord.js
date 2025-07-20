const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  visit_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  chief_complaint: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment_plan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medications_prescribed: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  follow_up_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vital_signs: {
    type: DataTypes.JSON,
    allowNull: true
  },
  lab_results: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_appointment_recommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'medical_records',
  indexes: [
    {
      fields: ['patient_id', 'visit_date']
    },
    {
      fields: ['doctor_id', 'visit_date']
    }
  ]
});

module.exports = MedicalRecord;
