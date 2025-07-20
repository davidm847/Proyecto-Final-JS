import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { DoctorService } from "../../../services/doctor.service";
import {
  DoctorAvailability,
  SetAvailability,
} from "../../../models/doctor.model";

@Component({
  selector: "app-availability-management",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="availability-management-container">
      <mat-card class="management-card">
        <mat-card-header>
          <mat-card-title>Manage Availability</mat-card-title>
          <mat-card-subtitle>Set your weekly availability</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form
            [formGroup]="availabilityForm"
            (ngSubmit)="submitAvailability()"
            class="availability-form"
          >
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Day</mat-label>
                <mat-select formControlName="day_of_week">
                  <mat-option
                    *ngFor="let day of daysOfWeek"
                    [value]="day.value"
                    >{{ day.label }}</mat-option
                  >
                </mat-select>
                <mat-error
                  *ngIf="
                    availabilityForm.get('day_of_week')?.hasError('required')
                  "
                >
                  Please select a day
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Start Time</mat-label>
                <input
                  matInput
                  formControlName="start_time"
                  placeholder="09:00"
                  pattern="[0-9]{2}:[0-9]{2}"
                />
                <mat-error
                  *ngIf="
                    availabilityForm.get('start_time')?.hasError('required')
                  "
                >
                  Start time is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>End Time</mat-label>
                <input
                  matInput
                  formControlName="end_time"
                  placeholder="17:00"
                  pattern="[0-9]{2}:[0-9]{2}"
                />
                <mat-error
                  *ngIf="availabilityForm.get('end_time')?.hasError('required')"
                >
                  End time is required
                </mat-error>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loading || !availabilityForm.valid"
              >
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">Save</span>
                <span *ngIf="loading">Saving...</span>
              </button>
            </div>
          </form>

          <div class="current-availability" *ngIf="availability.length > 0">
            <h3>Current Availability</h3>
            <table
              mat-table
              [dataSource]="availability"
              class="availability-table"
            >
              <ng-container matColumnDef="day">
                <th mat-header-cell *matHeaderCellDef>Day</th>
                <td mat-cell *matCellDef="let element">
                  {{ getDayLabel(element.day_of_week) }}
                </td>
              </ng-container>

              <ng-container matColumnDef="start">
                <th mat-header-cell *matHeaderCellDef>Start Time</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.start_time }}
                </td>
              </ng-container>

              <ng-container matColumnDef="end">
                <th mat-header-cell *matHeaderCellDef>End Time</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.end_time }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [color]="element.is_available ? 'primary' : 'warn'">
                    {{ element.is_available ? "Available" : "Unavailable" }}
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <div
            class="empty-state"
            *ngIf="availability.length === 0 && !loading"
          >
            <mat-icon>schedule</mat-icon>
            <h3>No Availability Set</h3>
            <p>
              Set your weekly availability so patients can book appointments
              with you.
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .availability-management-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .management-card {
        padding: 20px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 24px;
      }

      .form-field {
        width: 100%;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .availability-table {
        width: 100%;
      }

      @media (max-width: 600px) {
        .availability-management-container {
          padding: 10px;
        }

        .form-row {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AvailabilityManagementComponent implements OnInit {
  availabilityForm: FormGroup;
  availability: DoctorAvailability[] = [];
  loading = false;

  daysOfWeek = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thurdsay" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
  ];

  displayedColumns: string[] = ["day", "start", "end", "status"];

  constructor(
    private readonly fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly snackBar: MatSnackBar
  ) {
    this.availabilityForm = this.fb.group({
      day_of_week: [null, Validators.required],
      start_time: ["", Validators.required],
      end_time: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.loadAvailability();
  }

  loadAvailability(): void {
    this.doctorService.getMyAvailability().subscribe({
      next: ({ data: availability }) => {
        this.availability = availability;
      },
      error: (error) => {
        console.error("Error loading availability:", error);
        this.snackBar.open(
          "Error loading availability. Please try again.",
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
      },
    });
  }

  submitAvailability(): void {
    if (this.availabilityForm.invalid || this.loading) return;

    const availabilityData: SetAvailability[] = [
      {
        ...this.availabilityForm.value,
        is_available: true,
      },
    ];

    this.loading = true;
    this.doctorService.setAvailability(availabilityData).subscribe({
      next: () => {
        this.snackBar.open("Availability updated successfully", "Close", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.availabilityForm.reset();
        this.loadAvailability();
        this.loading = false;
      },
      error: (error) => {
        console.error("Error updating availability:", error);
        this.snackBar.open(
          "Error updating availability. Please try again.",
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

  getDayLabel(day: string): string {
    return this.daysOfWeek.find((d) => d.value === day)?.label ?? day;
  }
}
