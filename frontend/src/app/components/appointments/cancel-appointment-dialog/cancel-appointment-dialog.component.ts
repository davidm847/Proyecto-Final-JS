import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../../../models/appointment.model';

export interface CancelAppointmentDialogData {
  appointment: Appointment;
}

export interface CancelAppointmentDialogResult {
  confirmed: boolean;
  reason?: string;
}

@Component({
  selector: 'app-cancel-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="cancel-dialog">
      <h2 mat-dialog-title>
        <mat-icon color="warn">cancel</mat-icon>
        Cancel Appointment
      </h2>
      
      <div mat-dialog-content>
        <div class="appointment-info">
          <h3>Appointment Details</h3>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ formatDate(data.appointment.appointment_date) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">{{ data.appointment.appointment_time }}</span>
          </div>
          <div class="info-row">
            <span class="label">Doctor:</span>
            <span class="value">
              Dr. {{ data.appointment.doctor.user.first_name }} {{ data.appointment.doctor.user.last_name }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Type:</span>
            <span class="value">{{ data.appointment.appointment_type | titlecase }}</span>
          </div>
        </div>

        <form [formGroup]="cancelForm" class="cancel-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Cancellation</mat-label>
            <mat-select formControlName="reason">
              <mat-option value="Personal emergency">Personal emergency</mat-option>
              <mat-option value="Scheduling conflict">Scheduling conflict</mat-option>
              <mat-option value="Feeling better">Feeling better</mat-option>
              <mat-option value="Doctor unavailable">Doctor unavailable</mat-option>
              <mat-option value="Travel issues">Travel issues</mat-option>
              <mat-option value="Financial reasons">Financial reasons</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="cancelForm.get('reason')?.hasError('required')">
              Please select a reason for cancellation
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" *ngIf="cancelForm.get('reason')?.value === 'Other'">
            <mat-label>Additional Details</mat-label>
            <textarea 
              matInput 
              formControlName="customReason" 
              placeholder="Please provide more details..."
              rows="3">
            </textarea>
            <mat-error *ngIf="cancelForm.get('customReason')?.hasError('required')">
              Please provide additional details
            </mat-error>
          </mat-form-field>

          <div class="warning-message">
            <mat-icon color="warn">warning</mat-icon>
            <p>
              <strong>Please note:</strong> Cancelling this appointment may affect your ability to reschedule 
              within short notice. If this is a recurring appointment, only this instance will be cancelled.
            </p>
          </div>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          Keep Appointment
        </button>
        <button 
          mat-raised-button 
          color="warn" 
          (click)="onConfirmCancel()"
          [disabled]="!cancelForm.valid">
          <mat-icon>cancel</mat-icon>
          Cancel Appointment
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cancel-dialog {
      padding: 0;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      color: #d32f2f;
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

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
    }

    .cancel-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    @media (max-width: 600px) {
      .info-row {
        flex-direction: column;
        gap: 4px;
      }

      .dialog-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }

      .dialog-actions button {
        width: 100%;
      }
    }
  `]
})
export class CancelAppointmentDialogComponent {
  cancelForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CancelAppointmentDialogComponent, CancelAppointmentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CancelAppointmentDialogData
  ) {
    this.cancelForm = this.fb.group({
      reason: ['', Validators.required],
      customReason: ['']
    });

    // Add validation for custom reason when "Other" is selected
    this.cancelForm.get('reason')?.valueChanges.subscribe(reason => {
      const customReasonControl = this.cancelForm.get('customReason');
      if (reason === 'Other') {
        customReasonControl?.setValidators([Validators.required]);
      } else {
        customReasonControl?.clearValidators();
        customReasonControl?.setValue('');
      }
      customReasonControl?.updateValueAndValidity();
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onConfirmCancel(): void {
    if (this.cancelForm.valid) {
      const formValue = this.cancelForm.value;
      const reason = formValue.reason === 'Other' ? formValue.customReason : formValue.reason;
      
      this.dialogRef.close({ 
        confirmed: true, 
        reason: reason 
      });
    }
  }
}
