import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";
import { Appointment } from "../../../models/appointment.model";
import { AuthService } from "../../../services/auth.service";
import { User } from "../../../models/user.model";

export interface AppointmentDetailsDialogData {
  appointment: Appointment;
}

@Component({
  selector: "app-appointment-details-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
  ],
  template: `
    <div class="appointment-details-dialog">
      <h2 mat-dialog-title>
        <mat-icon>event</mat-icon>
        Appointment Details
      </h2>

      <div mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Info">
            <div class="tab-content">
              <!-- Status Badge -->
              <div class="status-section">
                <mat-chip
                  [color]="getStatusColor(data.appointment.status)"
                  class="status-chip"
                >
                  {{ data.appointment.status | titlecase }}
                </mat-chip>
                <mat-chip class="type-chip">
                  {{ data.appointment.appointment_type | titlecase }}
                </mat-chip>
              </div>

              <!-- Date and Time -->
              <div class="info-section">
                <h3>Schedule</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <mat-icon>calendar_today</mat-icon>
                    <div>
                      <div class="label">Date</div>
                      <div class="value">
                        {{ formatDate(data.appointment.appointment_date) }}
                      </div>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>access_time</mat-icon>
                    <div>
                      <div class="label">Time</div>
                      <div class="value">
                        {{ data.appointment.appointment_time }}
                      </div>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>schedule</mat-icon>
                    <div>
                      <div class="label">Duration</div>
                      <div class="value">
                        {{ data.appointment.duration }} minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Doctor Information (for patients) -->
              <div class="info-section" *ngIf="currentUser?.role === 'patient'">
                <h3>Doctor Information</h3>
                <div class="doctor-info">
                  <div class="doctor-card">
                    <div class="doctor-name">
                      Dr. {{ data.appointment.doctor.user.first_name }}
                      {{ data.appointment.doctor.user.last_name }}
                    </div>
                    <div class="doctor-specialization">
                      {{ data.appointment.doctor.specialization }}
                    </div>
                    <div
                      class="doctor-details"
                      *ngIf="data.appointment.doctor.experience_years"
                    >
                      <span class="experience"
                        >{{ data.appointment.doctor.experience_years }} years
                        experience</span
                      >
                    </div>
                    <div
                      class="contact-info"
                      *ngIf="data.appointment.doctor.user.phone"
                    >
                      <mat-icon>phone</mat-icon>
                      <span>{{ data.appointment.doctor.user.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Patient Information (for doctors/admins) -->
              <div
                class="info-section"
                *ngIf="
                  currentUser?.role === 'doctor' ||
                  currentUser?.role === 'admin'
                "
              >
                <h3>Patient Information</h3>
                <div class="patient-info">
                  <div class="patient-card">
                    <div class="patient-name">
                      {{ data.appointment.patient.first_name }}
                      {{ data.appointment.patient.last_name }}
                    </div>
                    <div class="contact-info">
                      <mat-icon>email</mat-icon>
                      <span>{{ data.appointment.patient.email }}</span>
                    </div>
                    <div
                      class="contact-info"
                      *ngIf="data.appointment.patient.phone"
                    >
                      <mat-icon>phone</mat-icon>
                      <span>{{ data.appointment.patient.phone }}</span>
                    </div>
                    <div
                      class="patient-details"
                      *ngIf="data.appointment.patient.date_of_birth"
                    >
                      <span class="age"
                        >Age:
                        {{
                          calculateAge(data.appointment.patient.date_of_birth)
                        }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Appointment Details -->
              <div class="info-section">
                <h3>Appointment Details</h3>
                <div class="appointment-details">
                  <div class="detail-item" *ngIf="data.appointment.reason">
                    <div class="label">Reason for Visit</div>
                    <div class="value">{{ data.appointment.reason }}</div>
                  </div>
                  <div class="detail-item" *ngIf="data.appointment.notes">
                    <div class="label">Notes</div>
                    <div class="value">{{ data.appointment.notes }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- History Tab -->
          <mat-tab
            label="History"
            *ngIf="
              data.appointment.cancelled_at ||
              data.appointment.updatedAt !== data.appointment.createdAt
            "
          >
            <div class="tab-content">
              <div class="history-section">
                <h3>Appointment History</h3>
                <div class="timeline">
                  <div class="timeline-item">
                    <mat-icon class="timeline-icon">add</mat-icon>
                    <div class="timeline-content">
                      <div class="timeline-title">Appointment Created</div>
                      <div class="timeline-date">
                        {{ formatDateTime(data.appointment.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <div
                    class="timeline-item"
                    *ngIf="
                      data.appointment.updatedAt !== data.appointment.createdAt
                    "
                  >
                    <mat-icon class="timeline-icon">edit</mat-icon>
                    <div class="timeline-content">
                      <div class="timeline-title">Appointment Updated</div>
                      <div class="timeline-date">
                        {{ formatDateTime(data.appointment.updatedAt) }}
                      </div>
                    </div>
                  </div>

                  <div
                    class="timeline-item"
                    *ngIf="data.appointment.cancelled_at"
                  >
                    <mat-icon class="timeline-icon warn">cancel</mat-icon>
                    <div class="timeline-content">
                      <div class="timeline-title">Appointment Cancelled</div>
                      <div class="timeline-date">
                        {{ formatDateTime(data.appointment.cancelled_at) }}
                      </div>
                      <div
                        class="timeline-reason"
                        *ngIf="data.appointment.cancellation_reason"
                      >
                        Reason: {{ data.appointment.cancellation_reason }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
        <button
          mat-raised-button
          color="primary"
          *ngIf="canEditAppointment()"
          (click)="onEdit()"
        >
          <mat-icon>edit</mat-icon>
          Edit Appointment
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .appointment-details-dialog {
        padding: 0;
        max-width: 600px;
        width: 100%;
      }

      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 20px 0;
        color: #1976d2;
      }

      .dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      .tab-content {
        padding: 20px 0;
      }

      .status-section {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }

      .status-chip {
        font-weight: 500;
      }

      .type-chip {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .info-section {
        margin-bottom: 24px;
      }

      .info-section h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
        font-weight: 500;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .info-item mat-icon {
        color: #666;
      }

      .label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }

      .value {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .doctor-card,
      .patient-card {
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #1976d2;
      }

      .doctor-name,
      .patient-name {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .doctor-specialization {
        color: #1976d2;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .doctor-details,
      .patient-details {
        margin-bottom: 8px;
      }

      .experience,
      .age {
        font-size: 14px;
        color: #666;
      }

      .contact-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        font-size: 14px;
        color: #666;
      }

      .contact-info mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .appointment-details {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .detail-item .label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      .detail-item .value {
        font-size: 16px;
        color: #333;
        line-height: 1.5;
      }

      .history-section h3 {
        margin: 0 0 20px 0;
        color: #333;
      }

      .timeline {
        position: relative;
        padding-left: 40px;
      }

      .timeline::before {
        content: "";
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e0e0e0;
      }

      .timeline-item {
        position: relative;
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .timeline-icon {
        position: absolute;
        left: -40px;
        background: white;
        border: 2px solid #1976d2;
        border-radius: 50%;
        padding: 4px;
        font-size: 16px;
        width: 24px;
        height: 24px;
        color: #1976d2;
      }

      .timeline-icon.warn {
        border-color: #f44336;
        color: #f44336;
      }

      .timeline-content {
        flex: 1;
      }

      .timeline-title {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .timeline-date {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }

      .timeline-reason {
        font-size: 14px;
        color: #f44336;
        font-style: italic;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 0 0 0;
        margin: 0;
      }

      mat-divider {
        margin: 20px 0;
      }

      /* Status colors */
      .mat-mdc-chip.mat-accent {
        --mdc-chip-container-color: #ff9800;
        color: white;
      }

      .mat-mdc-chip.mat-primary {
        --mdc-chip-container-color: #4caf50;
        color: white;
      }

      .mat-mdc-chip.mat-warn {
        --mdc-chip-container-color: #f44336;
        color: white;
      }

      @media (max-width: 600px) {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .status-section {
          flex-direction: column;
          align-items: flex-start;
        }

        .dialog-actions {
          flex-direction: column-reverse;
          gap: 8px;
        }

        .dialog-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class AppointmentDetailsDialogComponent {
  currentUser: User | null;

  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentDetailsDialogData,
    private readonly authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
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

  canEditAppointment(): boolean {
    const appointmentDateTime = new Date(
      this.data.appointment.appointment_date +
        "T" +
        this.data.appointment.appointment_time
    );
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Can edit if appointment is more than 24 hours away and not completed or cancelled
    return (
      hoursDiff > 24 &&
      !["completed", "cancelled"].includes(this.data.appointment.status)
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close({
      action: "edit",
      appointment: this.data.appointment,
    });
  }
}
