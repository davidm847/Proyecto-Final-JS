const { validationResult } = require("express-validator");
const {
  Appointment,
  Patient,
  Doctor,
  User,
  DoctorAvailability,
} = require("../models");
const { Op } = require("sequelize");
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} = require("../utils/email");

const createAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      doctor_id,
      appointment_date,
      appointment_time,
      duration = 30,
      appointment_type,
      reason,
    } = req.body;

    // Get patient info
    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: "user" }],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Check if doctor exists and is available
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ model: User, as: "user" }],
    });

    if (!doctor || !doctor.is_available) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or not available",
      });
    }

    // Check for conflicting appointments
    const appointmentDateTime = new Date(
      `${appointment_date}T${appointment_time}`
    );
    const endDateTime = new Date(
      appointmentDateTime.getTime() + duration * 60000
    );

    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_date,
        status: { [Op.notIn]: ["cancelled", "completed"] },
        [Op.or]: [
          {
            [Op.and]: [
              { appointment_time: { [Op.lte]: appointment_time } },
              { appointment_time: { [Op.gte]: appointment_time } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Time slot is already booked",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient_id: patient.id,
      doctor_id,
      appointment_date,
      appointment_time,
      duration,
      appointment_type,
      reason,
      status: "scheduled",
    });

    // Fetch complete appointment data
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(patient.user.email, {
        patientName: `${patient.user.first_name} ${patient.user.last_name}`,
        doctorName: `${doctor.user.first_name} ${doctor.user.last_name}`,
        date: appointment_date,
        time: appointment_time,
        duration,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: fullAppointment,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date, doctor_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filter by user role
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      whereClause.patient_id = patient.id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      whereClause.doctor_id = doctor.id;
    }

    // Additional filters
    if (status) whereClause.status = status;
    if (date) {
      const [year, month, day] = date.split("-").map(Number);

      // Fecha desde el inicio del día local
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
      // Fecha hasta el final del día local
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      whereClause.appointment_date = {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      };
    }
    if (doctor_id && req.user.role === "admin")
      whereClause.doctor_id = doctor_id;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: "patient",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["appointment_date", "ASC"],
        ["appointment_time", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check authorization
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (appointment.patient_id !== patient.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (appointment.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { appointment_date, appointment_time, duration, status, notes } =
      req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check authorization
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (appointment.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (appointment.patient_id !== patient.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    await appointment.update({
      appointment_date,
      appointment_time,
      duration,
      status,
      notes,
    });

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check authorization
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (appointment.patient_id !== patient.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (appointment.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    await appointment.update({
      status: "cancelled",
      cancelled_by: req.user.id,
      cancelled_at: new Date(),
      cancellation_reason,
    });

    // Send cancellation email
    try {
      await sendAppointmentCancellation(appointment.patient.user.email, {
        patientName: `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`,
        doctorName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        reason: cancellation_reason,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentStats = async (req, res, next) => {
  try {
    const totalAppointments = await Appointment.count();
    const scheduledAppointments = await Appointment.count({
      where: { status: "scheduled" },
    });
    const completedAppointments = await Appointment.count({
      where: { status: "completed" },
    });
    const cancelledAppointments = await Appointment.count({
      where: { status: "cancelled" },
    });

    const now = new Date().toISOString().split("T")[0];
    const [year, month, day] = now.split("-").map(Number);

    // Fecha desde el inicio del día local
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    // Fecha hasta el final del día local
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const todayAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getAppointmentStats,
};
