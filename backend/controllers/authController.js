const { validationResult } = require("express-validator");
const { User, Doctor, Patient } = require("../models");
const { generateToken } = require("../utils/jwt");
const { sequelize } = require("../config/database");
const { updateUser } = require("./userController");

const register = async (req, res, next) => {
  console.log("register");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    console.log("req.body", req.body);

    const {
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      ...roleSpecificData
    } = req.body;

    console.log("roleSpecificData", roleSpecificData);

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Create user
      const user = await User.create(
        {
          email,
          password,
          role,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          address,
        },
        { transaction }
      );

      // Create role-specific profile
      if (role === "doctor") {
        await Doctor.create(
          {
            user_id: user.id,
            license_number: roleSpecificData.license_number,
            specialization: roleSpecificData.specialization,
            experience_years: roleSpecificData.experience_years,
            consultation_fee: roleSpecificData.consultation_fee,
            education: roleSpecificData.education,
            bio: roleSpecificData.bio,
          },
          { transaction }
        );
      } else if (role === "patient") {
        const timestamp = Date.now();
        const patient_id = `P${timestamp.toString().slice(-8)}`;
        console.log("patient_id", patient_id);
        await Patient.create(
          {
            user_id: user.id,
            patient_id,
            emergency_contact_name: roleSpecificData.emergency_contact_name,
            emergency_contact_phone: roleSpecificData.emergency_contact_phone,
            blood_type: roleSpecificData.blood_type,
            allergies: roleSpecificData.allergies,
            chronic_conditions: roleSpecificData.chronic_conditions,
            current_medications: roleSpecificData.current_medications,
            insurance_provider: roleSpecificData.insurance_provider,
            insurance_number: roleSpecificData.insurance_number,
          },
          { transaction }
        );
      }

      await transaction.commit();

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("login");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user with role-specific data
    const user = await User.findOne({
      where: { email, is_active: true },
      include: [
        { model: Doctor, as: "doctorProfile" },
        { model: Patient, as: "patientProfile" },
      ],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Doctor, as: "doctorProfile" },
        { model: Patient, as: "patientProfile" },
      ],
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
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
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      ...roleSpecificData
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
      // Update user data
      await req.user.update(
        {
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          address,
        },
        { transaction }
      );

      // Update role-specific data
      if (req.user.role === "doctor" && roleSpecificData) {
        const doctor = await Doctor.findOne({
          where: { user_id: req.user.id },
        });
        if (doctor) {
          await doctor.update(roleSpecificData, { transaction });
        }
      } else if (req.user.role === "patient" && roleSpecificData) {
        const patient = await Patient.findOne({
          where: { user_id: req.user.id },
        });
        if (patient) {
          await patient.update(roleSpecificData, { transaction });
        }
      }

      await transaction.commit();

      const updatedUser = await User.findByPk(req.user.id, {
        include: [
          { model: Doctor, as: "doctorProfile" },
          { model: Patient, as: "patientProfile" },
        ],
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { current_password, new_password } = req.body;

    if (!(await req.user.comparePassword(current_password))) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    await req.user.update({ password: new_password });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
