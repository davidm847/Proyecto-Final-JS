const { body, param, query } = require("express-validator");

// Auth validations
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["admin", "doctor", "patient"])
    .withMessage("Role must be admin, doctor, or patient"),
  body("first_name")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .isMobilePhone("es-PE")
    .withMessage("Please provide a valid phone number"),
  body("date_of_birth")
    .optional()
    .isDate()
    .withMessage("Please provide a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  // Doctor-specific validations
  body("license_number")
    .if(body("role").equals("doctor"))
    .notEmpty()
    .withMessage("License number is required for doctors"),
  body("specialization")
    .if(body("role").equals("doctor"))
    .notEmpty()
    .withMessage("Specialization is required for doctors"),
  body("experience_years")
    .if(body("role").equals("doctor"))
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("consultation_fee")
    .if(body("role").equals("doctor"))
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Consultation fee must be a valid amount"),

  // Patient-specific validations
  body("blood_type")
    .if(body("role").equals("patient"))
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood type"),
  body("emergency_contact_phone")
    .if(body("role").equals("patient"))
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid emergency contact phone number"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Appointment validations
const createAppointmentValidation = [
  body("doctor_id")
    .isInt({ min: 1 })
    .withMessage("Valid doctor ID is required"),
  body("appointment_date")
    .isDate()
    .withMessage("Please provide a valid appointment date"),
  body("appointment_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid time in HH:MM format"),
  body("duration")
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage("Duration must be between 15 and 120 minutes"),
  body("appointment_type")
    .isIn(["consultation", "follow_up", "emergency", "routine_checkup"])
    .withMessage("Invalid appointment type"),
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason must be less than 500 characters"),
];

const updateAppointmentValidation = [
  body("appointment_date")
    .optional()
    .isDate()
    .withMessage("Please provide a valid appointment date"),
  body("appointment_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid time in HH:MM format"),
  body("duration")
    .optional()
    .isInt({ min: 15, max: 120 })
    .withMessage("Duration must be between 15 and 120 minutes"),
  body("status")
    .optional()
    .isIn(["scheduled", "confirmed", "cancelled", "completed", "no_show"])
    .withMessage("Invalid status"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
];

// Doctor availability validations
const setAvailabilityValidation = [
  body("availability")
    .isArray({ min: 1 })
    .withMessage("Availability must be an array with at least one item"),
  body("availability.*.day_of_week")
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Invalid day of week"),
  body("availability.*.start_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid start time in HH:MM format"),
  body("availability.*.end_time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid end time in HH:MM format"),
  body("availability.*.max_appointments")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Max appointments must be between 1 and 50"),
];

// Medical record validations
const createMedicalRecordValidation = [
  body("patient_id")
    .isInt({ min: 1 })
    .withMessage("Valid patient ID is required"),
  body("appointment_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid appointment ID is required"),
  body("chief_complaint")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Chief complaint must be less than 500 characters"),
  body("symptoms")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Symptoms must be less than 1000 characters"),
  body("diagnosis")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Diagnosis must be less than 1000 characters"),
  body("treatment_plan")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Treatment plan must be less than 1000 characters"),
  body("medications_prescribed")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Medications prescribed must be less than 1000 characters"),
  body("follow_up_instructions")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Follow-up instructions must be less than 1000 characters"),
  body("vital_signs")
    .optional()
    .isObject()
    .withMessage("Vital signs must be an object"),
  body("lab_results")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Lab results must be less than 2000 characters"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
  body("next_appointment_recommended")
    .optional()
    .isBoolean()
    .withMessage("Next appointment recommended must be a boolean"),
];

// Parameter validations
const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid ID is required"),
];

// User update validations
const updateUserValidation = [
  body("first_name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("date_of_birth")
    .optional()
    .isDate()
    .withMessage("Please provide a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean"),
];

// Doctor profile update validations
const updateDoctorProfileValidation = [
  body("specialization")
    .optional()
    .notEmpty()
    .withMessage("Specialization cannot be empty"),
  body("experience_years")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("consultation_fee")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Consultation fee must be a valid amount"),
  body("education")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Education must be less than 1000 characters"),
  body("bio")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),
  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("Is available must be a boolean"),
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  createAppointmentValidation,
  updateAppointmentValidation,
  setAvailabilityValidation,
  createMedicalRecordValidation,
  idParamValidation,
  updateUserValidation,
  updateDoctorProfileValidation,
};
