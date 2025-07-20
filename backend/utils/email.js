const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendAppointmentConfirmation = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Confirmation";
  const html = `
    <h2>Appointment Confirmation</h2>
    <p>Dear ${appointmentDetails.patientName},</p>
    <p>Your appointment has been confirmed with the following details:</p>
    <ul>
      <li><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</li>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Duration:</strong> ${appointmentDetails.duration} minutes</li>
    </ul>
    <p>Please arrive 15 minutes early for your appointment.</p>
    <p>Best regards,<br>Medical Management System</p>
  `;

  return await sendEmail(userEmail, subject, html);
};

const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Reminder";
  const html = `
    <h2>Appointment Reminder</h2>
    <p>Dear ${appointmentDetails.patientName},</p>
    <p>This is a reminder about your upcoming appointment:</p>
    <ul>
      <li><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</li>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Duration:</strong> ${appointmentDetails.duration} minutes</li>
    </ul>
    <p>Please arrive 15 minutes early for your appointment.</p>
    <p>Best regards,<br>Medical Management System</p>
  `;

  return await sendEmail(userEmail, subject, html);
};

const sendAppointmentCancellation = async (userEmail, appointmentDetails) => {
  const subject = "Appointment Cancellation";
  const html = `
    <h2>Appointment Cancellation</h2>
    <p>Dear ${appointmentDetails.patientName},</p>
    <p>Your appointment has been cancelled:</p>
    <ul>
      <li><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</li>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Reason:</strong> ${appointmentDetails.reason}</li>
    </ul>
    <p>Please contact us to reschedule your appointment.</p>
    <p>Best regards,<br>Medical Management System</p>
  `;

  return await sendEmail(userEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
};
