# Medical Management System - Backend

A comprehensive backend API for managing medical offices, appointments, and patient records.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, profile management for patients, doctors, and administrators
- **Appointment Management**: Book, reschedule, cancel appointments with automatic notifications
- **Doctor Availability**: Manage doctor schedules and availability
- **Medical Records**: Maintain patient medical history and diagnoses
- **Email Notifications**: Automated email notifications for appointments
- **Data Validation**: Comprehensive request validation
- **Security**: Password hashing, JWT tokens, rate limiting, and CORS protection

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Database Schema

### Users Table
- Basic user information (email, password, role, personal details)
- Roles: admin, doctor, patient

### Doctors Table
- Doctor-specific information (license, specialization, fees, bio)
- Links to Users table

### Patients Table
- Patient-specific information (medical details, emergency contacts)
- Links to Users table

### Doctor Availability Table
- Doctor working hours and availability
- Days of week with time slots

### Appointments Table
- Appointment scheduling and management
- Status tracking (scheduled, confirmed, cancelled, completed)

### Medical Records Table
- Patient medical history and diagnoses
- Treatment plans and prescriptions

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### User Management Routes (`/api/users`) - Admin Only
- `GET /` - Get all users
- `GET /stats` - Get user statistics
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `PUT /:id/deactivate` - Deactivate user
- `PUT /:id/activate` - Activate user

### Appointment Routes (`/api/appointments`)
- `POST /` - Create appointment (Patient only)
- `GET /` - Get appointments (filtered by role)
- `GET /stats` - Get appointment statistics (Admin only)
- `GET /:id` - Get appointment by ID
- `PUT /:id` - Update appointment
- `PUT /:id/cancel` - Cancel appointment

### Doctor Routes (`/api/doctors`)
- `GET /` - Get all doctors (Public)
- `GET /:id` - Get doctor by ID (Public)
- `GET /:id/availability` - Get doctor availability (Public)
- `PUT /profile` - Update doctor profile (Doctor only)
- `POST /availability` - Set doctor availability (Doctor only)
- `GET /availability/me` - Get current doctor's availability (Doctor only)
- `GET /appointments/me` - Get current doctor's appointments (Doctor only)
- `GET /stats/me` - Get current doctor's statistics (Doctor only)

### Medical Records Routes (`/api/medical-records`)
- `POST /` - Create medical record (Doctor only)
- `GET /` - Get medical records (filtered by role)
- `GET /:id` - Get medical record by ID
- `PUT /:id` - Update medical record (Doctor only)
- `DELETE /:id` - Delete medical record (Doctor/Admin only)
- `GET /patient/:patient_id` - Get patient's medical history

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=medical_management
   DB_USERNAME=root
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Create a MySQL database named `medical_management`
   - Run the database initialization script:
   ```bash
   npm run init-db
   ```

5. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Default Admin Account

After running the database initialization script, a default admin account will be created:

- **Email**: admin@medical.com
- **Password**: admin123
- **Role**: admin

**Note**: Change the default admin password after first login.

## Request/Response Examples

### Register a New Patient
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "role": "patient",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St, City, State",
  "blood_type": "A+",
  "allergies": "None",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "0987654321"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123"
}
```

### Create Appointment
```bash
POST /api/appointments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "doctor_id": 1,
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00",
  "duration": 30,
  "appointment_type": "consultation",
  "reason": "Regular checkup"
}
```

### Set Doctor Availability
```bash
POST /api/doctors/availability
Authorization: Bearer <doctor_jwt_token>
Content-Type: application/json

{
  "availability": [
    {
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "max_appointments": 10
    },
    {
      "day_of_week": "tuesday",
      "start_time": "09:00",
      "end_time": "17:00",
      "max_appointments": 10
    }
  ]
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password encryption
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin resource sharing protection
- **Input Validation**: Comprehensive request validation
- **Helmet**: Security headers protection

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── appointmentController.js
│   ├── doctorController.js
│   └── medicalRecordController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/
│   ├── User.js
│   ├── Doctor.js
│   ├── Patient.js
│   ├── DoctorAvailability.js
│   ├── Appointment.js
│   ├── MedicalRecord.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── appointments.js
│   ├── doctors.js
│   └── medicalRecords.js
├── scripts/
│   └── initDb.js
├── utils/
│   ├── jwt.js
│   └── email.js
├── .env
├── .env.example
├── package.json
├── README.md
└── server.js
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize database and create admin user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
