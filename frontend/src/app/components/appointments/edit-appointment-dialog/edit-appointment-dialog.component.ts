import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Appointment, AppointmentType, UpdateAppointment } from '../../../models/appointment.model';

export interface EditAppointmentDialogData {
  appointment: Appointment;
}

export interface EditAppointmentDialogResult {
  confirmed: boolean;
  updatedAppointment?: UpdateAppointment;
}

@Component({
  selector: 'app-edit-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edit-appointment-dialog">
      <h2 mat-dialog-title>
        <mat-icon color="primary">edit</mat-icon>
        Edit Appointment
      </h2>

      <div mat-dialog-content>
        <div class="appointment-info">
          <h3>Current Appointment</h3>
          <div class="current-info">
            <div class="info-item">
              <span class="label">Doctor:</span>
              <span class="value">
                Dr. {{ data.appointment.doctor.user.first_name }} {{ data.appointment.doctor.user.last_name }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Current Date:</span>
              <span class="value">{{ formatDate(data.appointment.appointment_date) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Current Time:</span>
              <span class="value">{{ data.appointment.appointment_time }}</span>
            </div>
          </div>
        </div>

        <form [formGroup]="editForm" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Appointment Date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                formControlName="appointment_date"
                [min]="minDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="editForm.get('appointment_date')?.hasError('required')">
                Date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Time</mat-label>
              <input
                matInput
                type="time"
                formControlName="appointment_time"
                min="08:00"
                max="18:00">
              <mat-error *ngIf="editForm.get('appointment_time')?.hasError('required')">
                Time is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Duration (minutes)</mat-label>
              <mat-select formControlName="duration">
                <mat-option value="15">15 minutes</mat-option>
                <mat-option value="30">30 minutes</mat-option>
                <mat-option value="45">45 minutes</mat-option>
                <mat-option value="60">1 hour</mat-option>
                <mat-option value="90">1.5 hours</mat-option>
                <mat-option value="120">2 hours</mat-option>
              </mat-select>
              <mat-error *ngIf="editForm.get('duration')?.hasError('required')">
                Duration is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Appointment Type</mat-label>
              <mat-select formControlName="appointment_type">
                <mat-option value="consultation">Consultation</mat-option>
                <mat-option value="follow_up">Follow-up</mat-option>
                <mat-option value="routine_checkup">Routine Checkup</mat-option>
                <mat-option value="emergency">Emergency</mat-option>
              </mat-select>
              <mat-error *ngIf="editForm.get('appointment_type')?.hasError('required')">
                Appointment type is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Visit</mat-label>
            <textarea
              matInput
              formControlName="reason"
              placeholder="Describe the reason for your visit"
              rows="3">
            </textarea>
            <mat-error *ngIf="editForm.get('reason')?.hasError('required')">
              Please provide a reason for the visit
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Notes (Optional)</mat-label>
            <textarea
              matInput
              formControlName="notes"
              placeholder="Any additional notes or special requirements"
              rows="3">
            </textarea>
          </mat-form-field>

          <div class="warning-message" *ngIf="hasSignificantChanges()">
            <mat-icon color="warn">warning</mat-icon>
            <p>
              <strong>Important:</strong> Changing the date or time may require confirmation 
              from the doctor's office. You may receive a notification about the status 
              of your request.
            </p>
          </div>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onSave()"
          [disabled]="!editForm.valid || saving">
          <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
          <mat-icon *ngIf="!saving">save</mat-icon>
          <span *ngIf="!saving">Save Changes</span>
          <span *ngIf="saving">Saving...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .edit-appointment-dialog {
      padding: 0;
      width: 100%;
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      color: #1976d2;
    }

    .appointment-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .appointment-info h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    .current-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-top: 16px;
    }

    .warning-message mat-icon {
      margin-top: 2px;
    }

    .warning-message p {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 0 0 0;
      margin: 0;
    }

    .dialog-actions button {
      min-width: 120px;
    }

    .dialog-actions button mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .current-info {
        gap: 12px;
      }

      .info-item {
        flex-direction: column;
        gap: 4px;
      }

      .dialog-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }

      .dialog-actions button {
        width: 100%;
        min-width: unset;
      }
    }
  `]
})
export class EditAppointmentDialogComponent implements OnInit {
  editForm: FormGroup;
  minDate = new Date();
  saving = false;
  originalValues: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAppointmentDialogComponent, EditAppointmentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: EditAppointmentDialogData
  ) {
    this.editForm = this.fb.group({
      appointment_date: [new Date(this.data.appointment.appointment_date), Validators.required],
      appointment_time: [this.data.appointment.appointment_time, Validators.required],
      duration: [this.data.appointment.duration, Validators.required],
      appointment_type: [this.data.appointment.appointment_type, Validators.required],
      reason: [this.data.appointment.reason || '', Validators.required],
      notes: [this.data.appointment.notes || '']
    });

    // Store original values for comparison
    this.originalValues = this.editForm.value;
  }

  ngOnInit(): void {
    // Set minimum date to tomorrow for rescheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasSignificantChanges(): boolean {
    const currentValues = this.editForm.value;
    const originalDate = new Date(this.data.appointment.appointment_date);
    const newDate = currentValues.appointment_date;
    const originalTime = this.data.appointment.appointment_time;
    const newTime = currentValues.appointment_time;

    // Check if date or time has changed
    const dateChanged = originalDate.toDateString() !== newDate.toDateString();
    const timeChanged = originalTime !== newTime;

    return dateChanged || timeChanged;
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.saving = true;
      
      const formValue = this.editForm.value;
      const updatedAppointment: UpdateAppointment = {
        appointment_date: this.formatDateForApi(formValue.appointment_date),
        appointment_time: formValue.appointment_time,
        duration: formValue.duration,
        appointment_type: formValue.appointment_type,
        reason: formValue.reason,
        notes: formValue.notes
      };

      // Simulate API call delay
      setTimeout(() => {
        this.saving = false;
        this.dialogRef.close({ 
          confirmed: true, 
          updatedAppointment: updatedAppointment 
        });
      }, 1000);
    }
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
