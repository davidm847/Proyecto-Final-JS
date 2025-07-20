const { validationResult } = require("express-validator");
const {
  Doctor,
  User,
  DoctorAvailability,
  Appointment,
  Patient,
} = require("../models");
const { Op } = require("sequelize");

const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, specialization, is_available } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (specialization)
      whereClause.specialization = { [Op.like]: `%${specialization}%` };
    if (is_available !== undefined)
      whereClause.is_available = is_available === "true";

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          where: { is_active: true },
          attributes: { exclude: ["password"] },
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        doctors,
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

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
        {
          model: DoctorAvailability,
          as: "availability",
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
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
      specialization,
      experience_years,
      consultation_fee,
      education,
      bio,
      is_available,
    } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    await doctor.update({
      specialization,
      experience_years,
      consultation_fee,
      education,
      bio,
      is_available,
    });

    const updatedDoctor = await Doctor.findByPk(doctor.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    res.json({
      success: true,
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

const setAvailability = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { availability } = req.body; // Array of availability objects

    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Remove existing availability
    await DoctorAvailability.destroy({ where: { doctor_id: doctor.id } });

    // Create new availability records
    const availabilityRecords = availability.map((slot) => ({
      doctor_id: doctor.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available || true,
      max_appointments: slot.max_appointments || 10,
    }));

    await DoctorAvailability.bulkCreate(availabilityRecords);

    const updatedAvailability = await DoctorAvailability.findAll({
      where: { doctor_id: doctor.id },
    });

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: updatedAvailability,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const availability = await DoctorAvailability.findAll({
      where: { doctor_id: doctor.id },
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const availability = await DoctorAvailability.findAll({
      where: { doctor_id: id, is_available: true },
    });

    // If date is provided, check for existing appointments
    let availableSlots = availability;
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const currentDate = new Date(year, month - 1, day); // mes empieza desde 0

      const dayOfWeek = currentDate
        .toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "America/Lima", // o tu zona deseada
        })
        .toLowerCase();

      availableSlots = availability.filter(
        (slot) => slot.day_of_week === dayOfWeek
      );

      console.log(availableSlots);

      // Get existing appointments for the date
      const existingAppointments = await Appointment.findAll({
        where: {
          doctor_id: id,
          appointment_date: date,
          status: { [Op.notIn]: ["cancelled", "completed"] },
        },
      });

      console.log("existingAppointments:", existingAppointments);

      // Filter out booked slots
      availableSlots = availableSlots.map((slot) => {
        const bookedCount = existingAppointments.filter(
          (apt) =>
            apt.appointment_time >= slot.start_time &&
            apt.appointment_time < slot.end_time
        ).length;

        return {
          ...slot.toJSON(),
          available_slots: Math.max(0, slot.max_appointments - bookedCount),
        };
      });

      console.log("availableSlots:", availableSlots);
    }

    res.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, date, status } = req.query;
    const offset = (page - 1) * limit;

    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const whereClause = { doctor_id: doctor.id };
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
    if (status) whereClause.status = status;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: "patient",
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

const getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const totalAppointments = await Appointment.count({
      where: { doctor_id: doctor.id },
    });
    const completedAppointments = await Appointment.count({
      where: { doctor_id: doctor.id, status: "completed" },
    });
    const todayAppointments = await Appointment.count({
      where: {
        doctor_id: doctor.id,
        appointment_date: new Date().toISOString().split("T")[0],
      },
    });

    res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        todayAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  setAvailability,
  getAvailability,
  getDoctorAvailability,
  getDoctorAppointments,
  getDoctorStats,
};
