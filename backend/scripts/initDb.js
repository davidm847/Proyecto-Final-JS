const { sequelize } = require("../config/database");
const {
  User,
  Doctor,
  Patient,
  DoctorAvailability,
  Appointment,
  MedicalRecord,
} = require("../models");

const initializeDatabase = async () => {
  try {
    console.log("🔄 Initializing database...");

    // Sync all models
    await sequelize.sync({ force: false });

    console.log("✅ Database models synchronized successfully");

    // Create admin user if not exists
    const adminUser = await User.findOne({
      where: { email: "admin@medical.com" },
    });
    if (!adminUser) {
      await User.create({
        email: "admin@medical.com",
        password: "admin123",
        role: "admin",
        first_name: "Admin",
        last_name: "User",
        is_active: true,
      });
      console.log("✅ Admin user created successfully");
    }

    console.log("🎉 Database initialization completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

initializeDatabase();
