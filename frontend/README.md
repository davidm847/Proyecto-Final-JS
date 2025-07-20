# Medical Management System - Frontend

This is the Angular frontend for the Medical Management System, a comprehensive web application for managing medical appointments, doctor availability, patient records, and administrative tasks.

## 🚀 Features

### User Management
- User registration and authentication (Patients, Doctors, Administrators)
- Role-based access control
- Profile management
- Password change functionality

### Appointment Management
- **Patients**: Book, view, and cancel appointments
- **Doctors**: View schedules, manage appointments, set availability
- **Admins**: Oversee all appointments and generate reports

### Medical Records
- **Doctors**: Create and manage medical records
- **Patients**: View medical history
- **Admins**: Access all medical records

### Doctor Availability
- Doctors can set their weekly availability
- Time slot management with 30-minute intervals
- Availability-based appointment booking

### Dashboard
- **Patient Dashboard**: Next appointments, medical history summary
- **Doctor Dashboard**: Today's schedule, patient statistics
- **Admin Dashboard**: System-wide statistics and metrics

## 🛠️ Tech Stack

- **Framework**: Angular 18
- **UI Library**: Angular Material
- **Styling**: SCSS with responsive design
- **Authentication**: JWT tokens with HTTP interceptors
- **Architecture**: Standalone components with lazy loading

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Angular CLI (`npm install -g @angular/cli`)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Make sure the backend API is running on `http://localhost:30001/api`

### 3. Development Server
```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200`

### 4. Build for Production
```bash
npm run build
# or
ng build --prod
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/              # Login, Registration
│   │   ├── appointments/      # Appointment management
│   │   ├── dashboard/         # Role-specific dashboards
│   │   ├── profile/           # User profile management
│   │   ├── admin/             # Admin-only components
│   │   ├── doctor/            # Doctor-specific features
│   │   ├── medical-records/   # Medical record management
│   │   └── shared/            # Shared components
│   ├── services/              # API services
│   ├── models/               # TypeScript interfaces
│   ├── guards/               # Route guards
│   ├── interceptors/         # HTTP interceptors
│   └── app.routes.ts         # Route configuration
├── environments/             # Environment configurations
└── styles/                  # Global styles
```

## 🔐 User Roles & Permissions

### Patient
- Book and manage appointments
- View medical history
- Update profile information

### Doctor
- View and manage appointments
- Set availability schedules
- Create and manage medical records
- View patient information

### Administrator
- Manage all users
- View system-wide statistics
- Generate reports
- Oversee all appointments and medical records

## 🎨 Components

### Core Components
- **LoginComponent**: User authentication
- **RegisterComponent**: User registration
- **DashboardComponent**: Role-specific dashboards
- **ProfileComponent**: Profile management

### Feature Components
- **BookAppointmentComponent**: Multi-step appointment booking
- **AppointmentListComponent**: Appointment management
- **AvailabilityManagementComponent**: Doctor availability setup
- **MedicalRecordListComponent**: Medical records overview
- **PatientHistoryComponent**: Comprehensive medical history

### Admin Components
- **UserManagementComponent**: User administration
- **ReportsComponent**: System reports and analytics

## 🔧 Services

- **AuthService**: Authentication and user management
- **AppointmentService**: Appointment CRUD operations
- **DoctorService**: Doctor-related API calls
- **UserService**: User management operations
- **MedicalRecordService**: Medical record operations

## 🎯 Key Features Implementation

### Authentication Flow
1. JWT-based authentication
2. Automatic token refresh
3. Role-based navigation
4. Secure route protection

### Appointment Booking
1. Doctor selection with search/filter
2. Date and time slot selection
3. Appointment details form
4. Confirmation and summary

### Responsive Design
- Mobile-first approach
- Material Design principles
- Adaptive layouts for all screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Clear Angular cache
   ```bash
   rm -rf .angular
   npm run build
   ```

2. **API Connection**: Verify backend is running on correct port

3. **Authentication Issues**: Check JWT token format and expiration

## 🤝 Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Follow the existing component structure

## 📄 License

This project is licensed under the MIT License.

## 🔗 Backend Integration

This frontend is designed to work with the Medical Management System backend API. Ensure the backend is running on `http://localhost:30001/api` before starting the frontend development server.

## 🎮 Default Users (for testing)

After setting up the backend, you can create test users with different roles to explore all features:

- **Admin**: Full system access
- **Doctor**: Medical professional features
- **Patient**: Patient portal features

Navigate to `/register` to create new accounts with appropriate roles.
