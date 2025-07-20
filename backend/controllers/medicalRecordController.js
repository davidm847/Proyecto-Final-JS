const { validationResult } = require("express-validator");
const {
  MedicalRecord,
  Patient,
  Doctor,
  User,
  Appointment,
} = require("../models");
const { Op } = require("sequelize");

const createMedicalRecord = async (req, res, next) => {
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
      patient_id,
      appointment_id,
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      medications_prescribed,
      follow_up_instructions,
      vital_signs,
      lab_results,
      notes,
      next_appointment_recommended,
    } = req.body;

    // Verify doctor
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // If appointment_id is provided, verify it exists and belongs to the doctor
    if (appointment_id) {
      const appointment = await Appointment.findByPk(appointment_id);
      if (!appointment || appointment.doctor_id !== doctor.id) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found or access denied",
        });
      }
    }

    const medicalRecord = await MedicalRecord.create({
      patient_id,
      doctor_id: doctor.id,
      appointment_id,
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      medications_prescribed,
      follow_up_instructions,
      vital_signs,
      lab_results,
      notes,
      next_appointment_recommended,
    });

    const fullRecord = await MedicalRecord.findByPk(medicalRecord.id, {
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
        {
          model: Appointment,
          as: "appointment",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      data: fullRecord,
    });
  } catch (error) {
    next(error);
  }
};

const getMedicalRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patient_id, date_from, date_to } = req.query;
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
    if (patient_id && req.user.role === "admin") {
      whereClause.patient_id = patient_id;
    }

    if (date_from || date_to) {
      whereClause.visit_date = {};
      if (date_from) whereClause.visit_date[Op.gte] = date_from;
      if (date_to) whereClause.visit_date[Op.lte] = date_to;
    }

    const { count, rows: records } = await MedicalRecord.findAndCountAll({
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
        {
          model: Appointment,
          as: "appointment",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["visit_date", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        records,
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

const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id, {
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
        {
          model: Appointment,
          as: "appointment",
        },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check authorization
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (record.patient_id !== patient.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (record.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

const updateMedicalRecord = async (req, res, next) => {
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
    const {
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      medications_prescribed,
      follow_up_instructions,
      vital_signs,
      lab_results,
      notes,
      next_appointment_recommended,
    } = req.body;

    const record = await MedicalRecord.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check authorization (only the doctor who created the record can update it)
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor || record.doctor_id !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await record.update({
      chief_complaint,
      symptoms,
      diagnosis,
      treatment_plan,
      medications_prescribed,
      follow_up_instructions,
      vital_signs,
      lab_results,
      notes,
      next_appointment_recommended,
    });

    const updatedRecord = await MedicalRecord.findByPk(id, {
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
        {
          model: Appointment,
          as: "appointment",
        },
      ],
    });

    res.json({
      success: true,
      message: "Medical record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    // Check authorization (only admin or the doctor who created the record can delete it)
    if (req.user.role !== "admin") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor || record.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    await record.destroy();

    res.json({
      success: true,
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getPatientMedicalHistory = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verify patient exists
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Check authorization
    if (req.user.role === "patient") {
      const userPatient = await Patient.findOne({
        where: { user_id: req.user.id },
      });
      if (userPatient.id !== parseInt(patient_id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const { count, rows: records } = await MedicalRecord.findAndCountAll({
      where: { patient_id },
      include: [
        {
          model: Doctor,
          as: "doctor",
          include: [{ model: User, as: "user" }],
        },
        {
          model: Appointment,
          as: "appointment",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["visit_date", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        records,
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

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientMedicalHistory,
};
