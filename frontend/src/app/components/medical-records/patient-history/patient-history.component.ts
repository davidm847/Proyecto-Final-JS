import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MedicalRecord } from "../../../models/medical-record.model";
import { MedicalRecordService } from "../../../services/medical-record.service";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-patient-history",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="patient-history-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>history</mat-icon>
          <mat-card-title>Medical History</mat-card-title>
          <mat-card-subtitle
            >Complete medical history and records</mat-card-subtitle
          >
        </mat-card-header>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading medical history...</p>
      </div>

      <div *ngIf="!loading && medicalRecords.length === 0" class="empty-state">
        <mat-icon>folder_open</mat-icon>
        <h3>No Medical Records Found</h3>
        <p>You don't have any medical records yet.</p>
      </div>

      <mat-accordion
        *ngIf="!loading && medicalRecords.length > 0"
        class="records-accordion"
      >
        <mat-expansion-panel
          *ngFor="let record of medicalRecords"
          class="record-panel"
        >
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="panel-title-content">
                <mat-icon>medical_services</mat-icon>
                <span>{{ formatDate(record.visit_date) }}</span>
              </div>
            </mat-panel-title>
            <mat-panel-description>
              <div class="panel-description-content">
                <span class="doctor-name"
                  >Dr. {{ record.doctor.user.first_name }}
                  {{ record.doctor.user.last_name }}</span
                >
                <mat-chip color="primary">{{
                  record.doctor.specialization
                }}</mat-chip>
              </div>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="record-content">
            <div class="record-section" *ngIf="record.chief_complaint">
              <h4><mat-icon>assignment</mat-icon> Chief Complaint</h4>
              <p>{{ record.chief_complaint }}</p>
            </div>

            <div class="record-section" *ngIf="record.symptoms">
              <h4><mat-icon>sick</mat-icon> Symptoms</h4>
              <p>{{ record.symptoms }}</p>
            </div>

            <div class="record-section" *ngIf="record.diagnosis">
              <h4><mat-icon>diagnosis</mat-icon> Diagnosis</h4>
              <p>{{ record.diagnosis }}</p>
            </div>

            <div class="record-section" *ngIf="record.vital_signs">
              <h4><mat-icon>favorite</mat-icon> Vital Signs</h4>
              <div class="vital-signs-grid">
                <div
                  class="vital-item"
                  *ngIf="record.vital_signs.blood_pressure"
                >
                  <strong>Blood Pressure:</strong>
                  {{ record.vital_signs.blood_pressure }}
                </div>
                <div class="vital-item" *ngIf="record.vital_signs.heart_rate">
                  <strong>Heart Rate:</strong>
                  {{ record.vital_signs.heart_rate }} bpm
                </div>
                <div class="vital-item" *ngIf="record.vital_signs.temperature">
                  <strong>Temperature:</strong>
                  {{ record.vital_signs.temperature }}°F
                </div>
                <div
                  class="vital-item"
                  *ngIf="record.vital_signs.respiratory_rate"
                >
                  <strong>Respiratory Rate:</strong>
                  {{ record.vital_signs.respiratory_rate }} /min
                </div>
                <div
                  class="vital-item"
                  *ngIf="record.vital_signs.oxygen_saturation"
                >
                  <strong>Oxygen Saturation:</strong>
                  {{ record.vital_signs.oxygen_saturation }}%
                </div>
              </div>
            </div>

            <div class="record-section" *ngIf="record.treatment_plan">
              <h4><mat-icon>healing</mat-icon> Treatment Plan</h4>
              <p>{{ record.treatment_plan }}</p>
            </div>

            <div class="record-section" *ngIf="record.medications_prescribed">
              <h4><mat-icon>medication</mat-icon> Medications Prescribed</h4>
              <p>{{ record.medications_prescribed }}</p>
            </div>

            <div class="record-section" *ngIf="record.lab_results">
              <h4><mat-icon>biotech</mat-icon> Lab Results</h4>
              <p>{{ record.lab_results }}</p>
            </div>

            <div class="record-section" *ngIf="record.follow_up_instructions">
              <h4><mat-icon>schedule</mat-icon> Follow-up Instructions</h4>
              <p>{{ record.follow_up_instructions }}</p>
            </div>

            <div class="record-section" *ngIf="record.notes">
              <h4><mat-icon>note</mat-icon> Additional Notes</h4>
              <p>{{ record.notes }}</p>
            </div>

            <div class="record-footer">
              <div class="footer-info">
                <mat-icon>schedule</mat-icon>
                <span>Created: {{ formatDateTime(record.createdAt) }}</span>
              </div>
              <div
                class="footer-info"
                *ngIf="record.next_appointment_recommended"
              >
                <mat-icon>event</mat-icon>
                <span>Next appointment recommended</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [
    `
      .patient-history-container {
        padding: 20px;
        max-width: 1000px;
        margin: 0 auto;
      }

      .header-card {
        margin-bottom: 20px;
      }

      .header-card mat-card-header {
        align-items: center;
      }

      .loading-container,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
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
        margin: 16px 0 8px 0;
        color: #666;
      }

      .empty-state p {
        color: #999;
      }

      .records-accordion {
        margin-top: 20px;
      }

      .record-panel {
        margin-bottom: 16px;
      }

      .panel-title-content,
      .panel-description-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .doctor-name {
        font-weight: 500;
      }

      .record-content {
        padding: 16px 0;
      }

      .record-section {
        margin-bottom: 24px;
      }

      .record-section:last-child {
        margin-bottom: 0;
      }

      .record-section h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        color: #333;
        font-size: 1.1rem;
        font-weight: 500;
      }

      .record-section h4 mat-icon {
        color: #3f51b5;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .record-section p {
        margin: 0;
        color: #666;
        line-height: 1.5;
      }

      .vital-signs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .vital-item {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
      }

      .vital-item strong {
        color: #333;
      }

      .record-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        margin-top: 16px;
        border-top: 1px solid #e0e0e0;
        font-size: 0.9rem;
        color: #666;
      }

      .footer-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .footer-info mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      @media (max-width: 600px) {
        .patient-history-container {
          padding: 10px;
        }

        .panel-description-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .vital-signs-grid {
          grid-template-columns: 1fr;
        }

        .record-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    `,
  ],
})
export class PatientHistoryComponent implements OnInit {
  medicalRecords: MedicalRecord[] = [];
  loading = true;

  constructor(
    private readonly medicalRecordService: MedicalRecordService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMedicalHistory();
  }

  loadMedicalHistory(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.medicalRecordService
        .getPatientMedicalHistory(currentUser.id)
        .subscribe({
          next: ({ data: records }) => {
            this.medicalRecords = records.sort(
              (a, b) =>
                new Date(b.visit_date).getTime() -
                new Date(a.visit_date).getTime()
            );
            this.loading = false;
          },
          error: (error) => {
            console.error("Error loading medical history:", error);
            this.loading = false;
          },
        });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
