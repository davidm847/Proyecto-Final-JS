const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createMedicalRecordValidation,
  idParamValidation
} = require('../middleware/validation');
const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientMedicalHistory
} = require('../controllers/medicalRecordController');

// @route   POST /api/medical-records
// @desc    Create a new medical record
// @access  Private/Doctor
router.post('/', auth, authorize('doctor'), createMedicalRecordValidation, createMedicalRecord);

// @route   GET /api/medical-records
// @desc    Get medical records (filtered by user role)
// @access  Private
router.get('/', auth, getMedicalRecords);

// @route   GET /api/medical-records/:id
// @desc    Get medical record by ID
// @access  Private
router.get('/:id', auth, idParamValidation, getMedicalRecordById);

// @route   PUT /api/medical-records/:id
// @desc    Update medical record
// @access  Private/Doctor
router.put('/:id', auth, authorize('doctor'), idParamValidation, createMedicalRecordValidation, updateMedicalRecord);

// @route   DELETE /api/medical-records/:id
// @desc    Delete medical record
// @access  Private/Doctor/Admin
router.delete('/:id', auth, authorize('doctor', 'admin'), idParamValidation, deleteMedicalRecord);

// @route   GET /api/medical-records/patient/:patient_id
// @desc    Get patient's medical history
// @access  Private
router.get('/patient/:patient_id', auth, idParamValidation, getPatientMedicalHistory);

module.exports = router;
