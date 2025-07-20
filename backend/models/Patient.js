const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    patient_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    blood_type: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    chronic_conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    current_medications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    insurance_provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insurance_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "patients",
  }
);

module.exports = Patient;
