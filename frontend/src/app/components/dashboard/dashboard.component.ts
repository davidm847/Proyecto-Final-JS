import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { AppointmentService } from "../../services/appointment.service";
import { UserService } from "../../services/user.service";
import { DoctorService } from "../../services/doctor.service";
import { User, UserRole, UserStats } from "../../models/user.model";
import { Appointment, AppointmentStats } from "../../models/appointment.model";
import { DoctorStats } from "../../models/doctor.model";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Welcome, {{ currentUser?.first_name }}!</h1>
        <p class="role-badge">{{ getRoleDisplayName() }}</p>
      </div>

      <!-- Admin Dashboard -->
      <div *ngIf="currentUser?.role === 'admin'" class="admin-dashboard">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>Total Users</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ userStats?.totalUsers || 0 }}</div>
              <div class="stat-subtitle">
                {{ userStats?.activeUsers || 0 }} active
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>Patients</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ userStats?.roleDistribution?.patients || 0 }}
              </div>
              <div class="stat-subtitle">Active patients</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>event</mat-icon>
              <mat-card-title>Patients</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ appointmentStats?.totalAppointments || 0 }}
              </div>
              <div class="stat-subtitle">
                {{ appointmentStats?.todayAppointments || 0 }} appointments
                today
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>local_hospital</mat-icon>
              <mat-card-title>Doctors</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ userStats?.roleDistribution?.doctors || 0 }}
              </div>
              <div class="stat-subtitle">Active doctors</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button
              mat-raised-button
              color="primary"
              (click)="navigateTo('/users')"
            >
              <mat-icon>people</mat-icon>
              Manage Users
            </button>
            <button
              mat-raised-button
              color="accent"
              (click)="navigateTo('/appointments')"
            >
              <mat-icon>event</mat-icon>
              View Appointments
            </button>
          </div>
        </div>
      </div>

      <!-- Doctor Dashboard -->
      <div *ngIf="currentUser?.role === 'doctor'" class="doctor-dashboard">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>today</mat-icon>
              <mat-card-title>Today's Appointments</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ todayAppointments.length }}</div>
              <div class="stat-subtitle">Scheduled for today</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>upcoming</mat-icon>
              <mat-card-title>Upcoming</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ doctorStats?.upcoming_appointments || 0 }}
              </div>
              <div class="stat-subtitle">This week</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>people_outline</mat-icon>
              <mat-card-title>Total Patients</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ doctorStats?.total_patients || 0 }}
              </div>
              <div class="stat-subtitle">Under your care</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>star</mat-icon>
              <mat-card-title>Rating</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">
                {{ doctorStats?.average_rating || 0 }}
              </div>
              <div class="stat-subtitle">Average rating</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="appointments-section">
          <h2>Today's Schedule</h2>
          <mat-card *ngIf="todayAppointments.length === 0" class="empty-state">
            <mat-card-content>
              <mat-icon>event_available</mat-icon>
              <p>No appointments scheduled for today</p>
            </mat-card-content>
          </mat-card>

          <div *ngIf="todayAppointments.length > 0" class="appointments-list">
            <mat-card
              *ngFor="let appointment of todayAppointments"
              class="appointment-card"
            >
              <mat-card-content>
                <div class="appointment-header">
                  <h3>
                    {{ appointment.patient.first_name }}
                    {{ appointment.patient.last_name }}
                  </h3>
                  <mat-chip [color]="getStatusColor(appointment.status)">{{
                    appointment.status
                  }}</mat-chip>
                </div>
                <div class="appointment-details">
                  <p>
                    <mat-icon>schedule</mat-icon>
                    {{ appointment.appointment_time }}
                  </p>
                  <p>
                    <mat-icon>medical_services</mat-icon>
                    {{ appointment.appointment_type }}
                  </p>
                  <p *ngIf="appointment.reason">
                    <mat-icon>note</mat-icon> {{ appointment.reason }}
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button
              mat-raised-button
              color="primary"
              (click)="navigateTo('/appointments')"
            >
              <mat-icon>event</mat-icon>
              View All Appointments
            </button>
            <button
              mat-raised-button
              color="accent"
              (click)="navigateTo('/availability')"
            >
              <mat-icon>schedule</mat-icon>
              Manage Availability
            </button>
            <button mat-raised-button (click)="navigateTo('/medical-records')">
              <mat-icon>folder_shared</mat-icon>
              Medical Records
            </button>
          </div>
        </div>
      </div>

      <!-- Patient Dashboard -->
      <div *ngIf="currentUser?.role === 'patient'" class="patient-dashboard">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>event_note</mat-icon>
              <mat-card-title>Next Appointment</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="nextAppointment; else noNextAppointment">
                <div class="stat-subtitle">
                  {{ formatDate(nextAppointment.appointment_date) }}
                </div>
                <div class="stat-subtitle">
                  {{ nextAppointment.appointment_time }}
                </div>
                <div class="stat-subtitle">
                  Dr. {{ nextAppointment.doctor.user.first_name }}
                  {{ nextAppointment.doctor.user.last_name }}
                </div>
              </div>
              <ng-template #noNextAppointment>
                <div class="stat-subtitle">No upcoming appointments</div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>history</mat-icon>
              <mat-card-title>Total Appointments</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ patientAppointments.length }}</div>
              <div class="stat-subtitle">All time</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>folder_shared</mat-icon>
              <mat-card-title>Medical Records</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-number">{{ medicalRecordsCount }}</div>
              <div class="stat-subtitle">Available records</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="recent-appointments">
          <h2>Recent Appointments</h2>
          <mat-card *ngIf="recentAppointments.length === 0" class="empty-state">
            <mat-card-content>
              <mat-icon>event_busy</mat-icon>
              <p>No recent appointments</p>
            </mat-card-content>
          </mat-card>

          <div *ngIf="recentAppointments.length > 0" class="appointments-list">
            <mat-card
              *ngFor="let appointment of recentAppointments"
              class="appointment-card"
            >
              <mat-card-content>
                <div class="appointment-header">
                  <h3>
                    Dr. {{ appointment.doctor.user.first_name }}
                    {{ appointment.doctor.user.last_name }}
                  </h3>
                  <mat-chip [color]="getStatusColor(appointment.status)">{{
                    appointment.status
                  }}</mat-chip>
                </div>
                <div class="appointment-details">
                  <p>
                    <mat-icon>calendar_today</mat-icon>
                    {{ formatDate(appointment.appointment_date) }}
                  </p>
                  <p>
                    <mat-icon>schedule</mat-icon>
                    {{ appointment.appointment_time }}
                  </p>
                  <p>
                    <mat-icon>medical_services</mat-icon>
                    {{ appointment.appointment_type }}
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button
              mat-raised-button
              color="primary"
              (click)="navigateTo('/book-appointment')"
            >
              <mat-icon>add_circle</mat-icon>
              Book Appointment
            </button>
            <button
              mat-raised-button
              color="accent"
              (click)="navigateTo('/appointments')"
            >
              <mat-icon>event</mat-icon>
              View Appointments
            </button>
            <button mat-raised-button (click)="navigateTo('/medical-history')">
              <mat-icon>folder_shared</mat-icon>
              Medical History
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-section {
        margin-bottom: 30px;
        text-align: center;
      }

      .welcome-section h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 300;
        color: #333;
      }

      .role-badge {
        display: inline-block;
        background: #3f51b5;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        margin-top: 10px;
        text-transform: capitalize;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .stat-card mat-card-header {
        color: white;
      }

      .stat-card .mat-mdc-card-avatar {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .stat-number {
        font-size: 2.5rem;
        font-weight: bold;
        line-height: 1;
        margin-bottom: 5px;
      }

      .stat-subtitle {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .appointments-section,
      .recent-appointments {
        margin-bottom: 30px;
      }

      .appointments-section h2,
      .recent-appointments h2,
      .quick-actions h2 {
        margin-bottom: 20px;
        font-weight: 500;
        color: #333;
      }

      .appointments-list {
        display: grid;
        gap: 15px;
      }

      .appointment-card {
        border-left: 4px solid #3f51b5;
      }

      .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .appointment-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
      }

      .appointment-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
      }

      .appointment-details p {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #666;
      }

      .appointment-details mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .quick-actions {
        margin-top: 30px;
      }

      .action-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .action-buttons button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        gap: 20px;
      }

      mat-chip.mat-accent {
        background-color: #ff9800;
        color: white;
      }

      mat-chip.mat-primary {
        background-color: #4caf50;
        color: white;
      }

      mat-chip.mat-warn {
        background-color: #f44336;
        color: white;
      }

      mat-icon.mat-mdc-card-avatar {
        width: 40px;
        height: 40px;
        font-size: 40px;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 10px;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .action-buttons {
          flex-direction: column;
        }

        .action-buttons button {
          width: 100%;
          justify-content: center;
        }

        .appointment-details {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  // Stats data
  userStats: UserStats | null = null;
  appointmentStats: AppointmentStats | null = null;
  doctorStats: DoctorStats | null = null;

  // Appointments data
  todayAppointments: Appointment[] = [];
  nextAppointment: Appointment | null = null;
  recentAppointments: Appointment[] = [];
  patientAppointments: Appointment[] = [];
  medicalRecordsCount = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly appointmentService: AppointmentService,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    switch (this.currentUser.role) {
      case UserRole.ADMIN:
        this.loadAdminData();
        break;
      case UserRole.DOCTOR:
        this.loadDoctorData();
        break;
      case UserRole.PATIENT:
        this.loadPatientData();
        break;
      default:
        this.loading = false;
    }
  }

  private loadAdminData(): void {
    // Load user stats
    this.userService.getUserStats().subscribe({
      next: ({ data: stats }) => {
        this.userStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading user stats:", error);
        this.loading = false;
      },
    });

    // Load appointment stats
    this.appointmentService.getAppointmentStats().subscribe({
      next: ({ data: stats }) => {
        this.appointmentStats = stats;
      },
      error: (error) => {
        console.error("Error loading appointment stats:", error);
      },
    });
  }

  private loadDoctorData(): void {
    // Load doctor's appointments for today
    const today = new Date().toISOString().split("T")[0];
    this.appointmentService.getAppointments({ date: today }).subscribe({
      next: ({ data }) => {
        this.todayAppointments = data.appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading today appointments:", error);
        this.loading = false;
      },
    });

    // Load doctor stats
    this.doctorService.getDoctorStats().subscribe({
      next: ({ data: stats }) => {
        this.doctorStats = stats;
      },
      error: (error) => {
        console.error("Error loading doctor stats:", error);
      },
    });
  }

  private loadPatientData(): void {
    // Load patient's appointments
    this.appointmentService.getAppointments().subscribe({
      next: ({ data }) => {
        this.patientAppointments = data.appointments;
        this.findNextAppointment(data.appointments);
        this.findRecentAppointments(data.appointments);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading patient appointments:", error);
        this.loading = false;
      },
    });
  }

  private findNextAppointment(appointments: Appointment[]): void {
    const now = new Date();
    const upcomingAppointments = appointments
      .filter((apt) => {
        const formattedDate = apt.appointment_date.split("T")[0];
        const formattedTime = apt.appointment_time;
        const appointmentDateTime = new Date(
          formattedDate + "T" + formattedTime
        );

        return appointmentDateTime > now;
      })
      .sort((a, b) => {
        const aFormattedDate = a.appointment_date.split("T")[0];
        const aFormattedTime = a.appointment_time;
        const appointmentDateTime = new Date(
          aFormattedDate + "T" + aFormattedTime
        );

        const bFormattedDate = b.appointment_date.split("T")[0];
        const bFormattedTime = b.appointment_time;
        const nextAppointmentDateTime = new Date(
          bFormattedDate + "T" + bFormattedTime
        );

        return (
          appointmentDateTime.getTime() - nextAppointmentDateTime.getTime()
        );
      });

    this.nextAppointment = upcomingAppointments[0] || null;
  }

  private findRecentAppointments(appointments: Appointment[]): void {
    const now = new Date();
    this.recentAppointments = appointments
      .filter((apt) => {
        const formattedDate = apt.appointment_date.split("T")[0];
        const formattedTime = apt.appointment_time;
        const appointmentDateTime = new Date(
          formattedDate + "T" + formattedTime
        );

        return appointmentDateTime > now;
      })
      .sort((a, b) => {
        const aFormattedDate = a.appointment_date.split("T")[0];
        const aFormattedTime = a.appointment_time;
        const appointmentDateTime = new Date(
          aFormattedDate + "T" + aFormattedTime
        );

        const bFormattedDate = b.appointment_date.split("T")[0];
        const bFormattedTime = b.appointment_time;
        const nextAppointmentDateTime = new Date(
          bFormattedDate + "T" + bFormattedTime
        );

        return (
          appointmentDateTime.getTime() - nextAppointmentDateTime.getTime()
        );
      })
      .slice(0, 3);
  }

  getRoleDisplayName(): string {
    switch (this.currentUser?.role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.DOCTOR:
        return "Doctor";
      case UserRole.PATIENT:
        return "Patient";
      default:
        return "";
    }
  }

  getStatusColor(status: string): "primary" | "accent" | "warn" | undefined {
    switch (status) {
      case "completed":
      case "confirmed":
        return "primary";
      case "scheduled":
        return "accent";
      case "cancelled":
      case "no_show":
        return "warn";
      default:
        return undefined;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
