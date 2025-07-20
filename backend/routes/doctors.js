const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  idParamValidation,
  updateDoctorProfileValidation,
  setAvailabilityValidation
} = require('../middleware/validation');
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  setAvailability,
  getAvailability,
  getDoctorAvailability,
  getDoctorAppointments,
  getDoctorStats
} = require('../controllers/doctorController');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', getAllDoctors);

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', idParamValidation, getDoctorById);

// @route   GET /api/doctors/:id/availability
// @desc    Get doctor availability
// @access  Public
router.get('/:id/availability', idParamValidation, getDoctorAvailability);

// @route   PUT /api/doctors/profile
// @desc    Update doctor profile
// @access  Private/Doctor
router.put('/profile', auth, authorize('doctor'), updateDoctorProfileValidation, updateDoctorProfile);

// @route   POST /api/doctors/availability
// @desc    Set doctor availability
// @access  Private/Doctor
router.post('/availability', auth, authorize('doctor'), setAvailabilityValidation, setAvailability);

// @route   GET /api/doctors/availability/me
// @desc    Get current doctor's availability
// @access  Private/Doctor
router.get('/availability/me', auth, authorize('doctor'), getAvailability);

// @route   GET /api/doctors/appointments/me
// @desc    Get current doctor's appointments
// @access  Private/Doctor
router.get('/appointments/me', auth, authorize('doctor'), getDoctorAppointments);

// @route   GET /api/doctors/stats/me
// @desc    Get current doctor's statistics
// @access  Private/Doctor
router.get('/stats/me', auth, authorize('doctor'), getDoctorStats);

module.exports = router;
