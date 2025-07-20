import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MedicalRecord } from "../../../models/medical-record.model";
import { MedicalRecordService } from "../../../services/medical-record.service";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-medical-record-list",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="medical-record-list-container">
      <mat-card class="header-card">
        <mat-card-title>Medical Records</mat-card-title>
        <mat-card-subtitle>Your medical records history</mat-card-subtitle>
      </mat-card>

      <table mat-table [dataSource]="medicalRecords" class="full-width-table">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let record">{{ record.id }}</td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="visit_date">
          <th mat-header-cell *matHeaderCellDef>Visit Date</th>
          <td mat-cell *matCellDef="let record">
            {{ record.visit_date | date }}
          </td>
        </ng-container>

        <!-- Doctor Column -->
        <ng-container matColumnDef="doctor">
          <th mat-header-cell *matHeaderCellDef>Doctor</th>
          <td mat-cell *matCellDef="let record">
            {{ record.doctor.user.first_name }}
            {{ record.doctor.user.last_name }}
          </td>
        </ng-container>

        <!-- Chief Complaint Column -->
        <ng-container matColumnDef="chief_complaint">
          <th mat-header-cell *matHeaderCellDef>Chief Complaint</th>
          <td mat-cell *matCellDef="let record">
            {{ record.chief_complaint }}
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let record">
            <button mat-icon-button (click)="viewDetails(record.id)">
              <mat-icon>visibility</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading medical records...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .medical-record-list-container {
        padding: 20px;
      }

      .header-card {
        margin-bottom: 20px;
      }

      .full-width-table {
        width: 100%;
        margin-bottom: 20px;
      }

      .mat-header-cell,
      .mat-cell {
        text-align: left;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      mat-spinner {
        margin-bottom: 10px;
      }
    `,
  ],
})
export class MedicalRecordListComponent implements OnInit {
  medicalRecords: MedicalRecord[] = [];
  displayedColumns: string[] = [
    "id",
    "visit_date",
    "doctor",
    "chief_complaint",
    "actions",
  ];
  loading = true;

  constructor(
    private readonly medicalRecordService: MedicalRecordService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.medicalRecordService.getMedicalRecords(currentUser.id).subscribe({
        next: ({ data }) => {
          this.medicalRecords = data.records;
          this.loading = false;
        },
        error: (error) => {
          console.error("Error loading medical records:", error);
          this.loading = false;
        },
      });
    }
  }

  viewDetails(recordId: number): void {
    // Implement navigation to details page
  }
}
