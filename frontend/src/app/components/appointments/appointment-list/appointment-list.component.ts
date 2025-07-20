import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

import { AppointmentService } from "../../../services/appointment.service";
import { AuthService } from "../../../services/auth.service";
import {
  Appointment,
  AppointmentStatus,
} from "../../../models/appointment.model";
import { User, UserRole } from "../../../models/user.model";
import {
  CancelAppointmentDialogComponent,
  CancelAppointmentDialogData,
} from "../cancel-appointment-dialog/cancel-appointment-dialog.component";
import {
  AppointmentDetailsDialogComponent,
  AppointmentDetailsDialogData,
} from "../appointment-details-dialog/appointment-details-dialog.component";
import {
  EditAppointmentDialogComponent,
  EditAppointmentDialogData,
} from "../edit-appointment-dialog/edit-appointment-dialog.component";

@Component({
  selector: "app-appointment-list",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  template: `
    <div class="appointment-list-container">
      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>{{ getTitle() }}</mat-card-title>
          <mat-card-subtitle>{{ getSubtitle() }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <form [formGroup]="filterForm" class="filter-section">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select
                  formControlName="status"
                  (selectionChange)="onFilterChange()"
                >
                  <mat-option value="">All Statuses</mat-option>
                  <mat-option value="scheduled">Scheduled</mat-option>
                  <mat-option value="confirmed">Confirmed</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                  <mat-option value="no_show">No Show</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Date From</mat-label>
                <input
                  matInput
                  [matDatepicker]="fromPicker"
                  formControlName="dateFrom"
                  (dateChange)="onFilterChange()"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="fromPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Date To</mat-label>
                <input
                  matInput
                  [matDatepicker]="toPicker"
                  formControlName="dateTo"
                  (dateChange)="onFilterChange()"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="toPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                (click)="clearFilters()"
              >
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            </div>
          </form>

          <!-- Quick Actions -->
          <div class="quick-actions" *ngIf="currentUser?.role === 'patient'">
            <button
              mat-raised-button
              color="primary"
              (click)="bookNewAppointment()"
            >
              <mat-icon>add</mat-icon>
              Book New Appointment
            </button>
          </div>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="loading">
            <mat-spinner></mat-spinner>
            <p>Loading appointments...</p>
          </div>

          <!-- Appointments Table -->
          <div class="table-container" *ngIf="!loading">
            <table
              mat-table
              [dataSource]="filteredAppointments"
              class="appointments-table"
              matSort
            >
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="date-cell">
                    <div class="date">
                      {{ formatDate(appointment.appointment_date) }}
                    </div>
                    <div class="time">{{ appointment.appointment_time }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Doctor Column (for patients) -->
              <ng-container matColumnDef="doctor">
                <th mat-header-cell *matHeaderCellDef>Doctor</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="doctor-cell">
                    <div class="name">
                      Dr. {{ appointment.doctor.user.first_name }}
                      {{ appointment.doctor.user.last_name }}
                    </div>
                    <div class="specialization">
                      {{ appointment.doctor.specialization }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Patient Column (for doctors/admins) -->
              <ng-container matColumnDef="patient">
                <th mat-header-cell *matHeaderCellDef>Patient</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="patient-cell">
                    <div class="name">
                      {{ appointment.patient.first_name }}
                      {{ appointment.patient.last_name }}
                    </div>
                    <div class="email">{{ appointment.patient.email }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let appointment">
                  <mat-chip class="type-chip">{{
                    appointment.appointment_type | titlecase
                  }}</mat-chip>
                </td>
              </ng-container>

              <!-- Reason Column -->
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Reason</th>
                <td mat-cell *matCellDef="let appointment">
                  <span class="reason-text">{{
                    appointment.reason || "N/A"
                  }}</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let appointment">
                  <mat-chip
                    [color]="getStatusColor(appointment.status)"
                    class="status-chip"
                  >
                    {{ appointment.status | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let appointment">
                  <div class="actions-cell">
                    <!-- Quick Cancel Button for upcoming appointments -->
                    <button
                      mat-icon-button
                      color="warn"
                      *ngIf="canCancelAppointment(appointment)"
                      (click)="cancelAppointment(appointment)"
                      matTooltip="Cancel Appointment"
                      class="quick-cancel-btn"
                    >
                      <mat-icon>cancel</mat-icon>
                    </button>

                    <!-- More Actions Menu -->
                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button
                        mat-menu-item
                        (click)="viewAppointment(appointment)"
                      >
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button
                        mat-menu-item
                        *ngIf="canEditAppointment(appointment)"
                        (click)="editAppointment(appointment)"
                      >
                        <mat-icon>edit</mat-icon>
                        Edit
                      </button>
                      <button
                        mat-menu-item
                        *ngIf="canCancelAppointment(appointment)"
                        (click)="cancelAppointment(appointment)"
                      >
                        <mat-icon>cancel</mat-icon>
                        Cancel Appointment
                      </button>
                      <button
                        mat-menu-item
                        *ngIf="canCompleteAppointment(appointment)"
                        (click)="completeAppointment(appointment)"
                      >
                        <mat-icon>check_circle</mat-icon>
                        Mark as Complete
                      </button>
                    </mat-menu>
                  </div>
                </td>
              </ng-container>

              <!-- Table Header and Rows -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="appointment-row"
                [class.past-appointment]="isPastAppointment(row)"
              ></tr>
            </table>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="filteredAppointments.length === 0">
              <mat-icon>event_busy</mat-icon>
              <h3>No Appointments Found</h3>
              <p>{{ getEmptyStateMessage() }}</p>
              <button
                mat-raised-button
                color="primary"
                *ngIf="currentUser?.role === 'patient'"
                (click)="bookNewAppointment()"
              >
                Book Your First Appointment
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .appointment-list-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .list-card {
        padding: 20px;
      }

      .filter-section {
        margin-bottom: 24px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .filter-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .filter-field {
        min-width: 150px;
      }

      .quick-actions {
        margin-bottom: 24px;
        display: flex;
        gap: 12px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        gap: 20px;
      }

      .table-container {
        overflow-x: auto;
      }

      .appointments-table {
        width: 100%;
        min-width: 800px;
      }

      .appointment-row {
        transition: background-color 0.2s ease;
      }

      .appointment-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .past-appointment {
        opacity: 0.7;
      }

      .date-cell {
        display: flex;
        flex-direction: column;
      }

      .date {
        font-weight: 500;
        color: #333;
      }

      .time {
        font-size: 0.875rem;
        color: #666;
      }

      .doctor-cell,
      .patient-cell {
        display: flex;
        flex-direction: column;
      }

      .name {
        font-weight: 500;
        color: #333;
      }

      .specialization,
      .email {
        font-size: 0.875rem;
        color: #666;
      }

      .type-chip {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .status-chip {
        font-weight: 500;
      }

      .reason-text {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #666;
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .empty-state p {
        margin: 0 0 24px 0;
        max-width: 400px;
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

      @media (max-width: 768px) {
        .appointment-list-container {
          padding: 10px;
        }

        .filter-row {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-field {
          min-width: unset;
          width: 100%;
        }

        .appointments-table {
          font-size: 0.875rem;
        }

        .quick-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AppointmentListComponent implements OnInit {
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading = true;

  filterForm: FormGroup;
  displayedColumns: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [""],
      dateFrom: [""],
      dateTo: [""],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.setDisplayedColumns();
    this.loadAppointments();
  }

  setDisplayedColumns(): void {
    switch (this.currentUser?.role) {
      case UserRole.PATIENT:
        this.displayedColumns = [
          "date",
          "doctor",
          "type",
          "reason",
          "status",
          "actions",
        ];
        break;
      case UserRole.DOCTOR:
        this.displayedColumns = [
          "date",
          "patient",
          "type",
          "reason",
          "status",
          "actions",
        ];
        break;
      case UserRole.ADMIN:
        this.displayedColumns = [
          "date",
          "doctor",
          "patient",
          "type",
          "reason",
          "status",
          "actions",
        ];
        break;
      default:
        this.displayedColumns = ["date", "type", "status"];
    }
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({
      next: ({ data }) => {
        this.appointments = data.appointments;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading appointments:", error);
        this.snackBar.open(
          "Error loading appointments. Please try again.",
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
        this.loading = false;
      },
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.appointments.length === 0) {
      this.filteredAppointments = [];
      return;
    }

    let filtered = [...this.appointments];
    const filters = this.filterForm.value;

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (apt) => new Date(apt.appointment_date) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(
        (apt) => new Date(apt.appointment_date) <= toDate
      );
    }

    this.filteredAppointments = filtered.sort(
      (a, b) =>
        new Date(b.appointment_date + "T" + b.appointment_time).getTime() -
        new Date(a.appointment_date + "T" + a.appointment_time).getTime()
    );
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  getTitle(): string {
    switch (this.currentUser?.role) {
      case UserRole.PATIENT:
        return "My Appointments";
      case UserRole.DOCTOR:
        return "My Patient Appointments";
      case UserRole.ADMIN:
        return "All Appointments";
      default:
        return "Appointments";
    }
  }

  getSubtitle(): string {
    switch (this.currentUser?.role) {
      case UserRole.PATIENT:
        return "View and manage your medical appointments";
      case UserRole.DOCTOR:
        return "Manage your patient appointments and schedule";
      case UserRole.ADMIN:
        return "Overview of all appointments in the system";
      default:
        return "";
    }
  }

  getEmptyStateMessage(): string {
    switch (this.currentUser?.role) {
      case UserRole.PATIENT:
        return "You don't have any appointments yet. Book your first appointment to get started.";
      case UserRole.DOCTOR:
        return "No patient appointments found. Patients will be able to book appointments with you once your availability is set.";
      case UserRole.ADMIN:
        return "No appointments found in the system.";
      default:
        return "No appointments found.";
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  isPastAppointment(appointment: Appointment): boolean {
    const appointmentDateTime = new Date(
      appointment.appointment_date + "T" + appointment.appointment_time
    );
    return appointmentDateTime < new Date();
  }

  canEditAppointment(appointment: Appointment): boolean {
    const appointmentDateTime = new Date(
      appointment.appointment_date + "T" + appointment.appointment_time
    );
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Can edit if appointment is more than 24 hours away and not completed or cancelled
    return (
      hoursDiff > 24 && !["completed", "cancelled"].includes(appointment.status)
    );
  }

  canCancelAppointment(appointment: Appointment): boolean {
    return (
      !["completed", "cancelled"].includes(appointment.status) &&
      !this.isPastAppointment(appointment)
    );
  }

  canCompleteAppointment(appointment: Appointment): boolean {
    return (
      this.currentUser?.role === UserRole.DOCTOR &&
      appointment.status === "confirmed" &&
      this.isPastAppointment(appointment)
    );
  }

  viewAppointment(appointment: Appointment): void {
    const dialogData: AppointmentDetailsDialogData = {
      appointment: appointment,
    };

    const dialogRef = this.dialog.open(AppointmentDetailsDialogComponent, {
      width: "700px",
      maxWidth: "90vw",
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === "edit") {
        this.editAppointment(result.appointment);
      }
    });
  }

  editAppointment(appointment: Appointment): void {
    const dialogData: EditAppointmentDialogData = {
      appointment: appointment,
    };

    const dialogRef = this.dialog.open(EditAppointmentDialogComponent, {
      width: "600px",
      maxWidth: "90vw",
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed && result.updatedAppointment) {
        this.performUpdate(appointment.id, result.updatedAppointment);
      }
    });
  }

  private performUpdate(appointmentId: number, updatedData: any): void {
    this.appointmentService
      .updateAppointment(appointmentId, updatedData)
      .subscribe({
        next: () => {
          this.snackBar.open("Appointment updated successfully", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadAppointments();
        },
        error: (error) => {
          console.error("Error updating appointment:", error);
          const errorMessage =
            error.error?.message ||
            "Error updating appointment. Please try again.";
          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
  }

  cancelAppointment(appointment: Appointment): void {
    const dialogData: CancelAppointmentDialogData = {
      appointment: appointment,
    };

    const dialogRef = this.dialog.open(CancelAppointmentDialogComponent, {
      width: "500px",
      maxWidth: "90vw",
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.performCancellation(appointment.id, result.reason);
      }
    });
  }

  private performCancellation(appointmentId: number, reason?: string): void {
    this.appointmentService.cancelAppointment(appointmentId, reason).subscribe({
      next: () => {
        this.snackBar.open("Appointment cancelled successfully", "Close", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.loadAppointments();
      },
      error: (error) => {
        console.error("Error cancelling appointment:", error);
        const errorMessage =
          error.error?.message ||
          "Error cancelling appointment. Please try again.";
        this.snackBar.open(errorMessage, "Close", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  completeAppointment(appointment: Appointment): void {
    this.appointmentService
      .updateAppointment(appointment.id, {
        status: "completed" as AppointmentStatus,
      })
      .subscribe({
        next: () => {
          this.snackBar.open("Appointment marked as completed", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadAppointments();
        },
        error: (error) => {
          console.error("Error updating appointment:", error);
          this.snackBar.open(
            "Error updating appointment. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      });
  }

  bookNewAppointment(): void {
    this.router.navigate(["/book-appointment"]);
  }
}
