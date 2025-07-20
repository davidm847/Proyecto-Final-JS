const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createAppointmentValidation,
  updateAppointmentValidation,
  idParamValidation
} = require('../middleware/validation');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getAppointmentStats
} = require('../controllers/appointmentController');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private/Patient
router.post('/', auth, authorize('patient'), createAppointmentValidation, createAppointment);

// @route   GET /api/appointments
// @desc    Get appointments (filtered by user role)
// @access  Private
router.get('/', auth, getAppointments);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private/Admin
router.get('/stats', auth, authorize('admin'), getAppointmentStats);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, idParamValidation, getAppointmentById);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, idParamValidation, updateAppointmentValidation, updateAppointment);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', auth, idParamValidation, cancelAppointment);

module.exports = router;
