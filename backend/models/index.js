const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const DoctorAvailability = require('./DoctorAvailability');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');

// Define associations
// User associations
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile' });

// Doctor associations
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Doctor.hasMany(DoctorAvailability, { foreignKey: 'doctor_id', as: 'availability' });
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id', as: 'medicalRecords' });

// Patient associations
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medicalRecords' });

// DoctorAvailability associations
DoctorAvailability.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Appointment associations
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Appointment.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledBy' });
Appointment.hasOne(MedicalRecord, { foreignKey: 'appointment_id', as: 'medicalRecord' });

// MedicalRecord associations
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = {
  User,
  Doctor,
  Patient,
  DoctorAvailability,
  Appointment,
  MedicalRecord
};
