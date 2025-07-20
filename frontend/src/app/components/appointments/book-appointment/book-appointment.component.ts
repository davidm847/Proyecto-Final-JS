import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatStepperModule } from "@angular/material/stepper";
import { MatChipsModule } from "@angular/material/chips";

import { DoctorService } from "../../../services/doctor.service";
import { AppointmentService } from "../../../services/appointment.service";
import { Doctor, DoctorAvailability } from "../../../models/doctor.model";
import {
  CreateAppointment,
  AppointmentType,
} from "../../../models/appointment.model";

@Component({
  selector: "app-book-appointment",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatChipsModule,
  ],
  template: `
    <div class="book-appointment-container">
      <mat-card class="booking-card">
        <mat-card-header>
          <mat-card-title>Book New Appointment</mat-card-title>
          <mat-card-subtitle
            >Schedule an appointment with our doctors</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Select Doctor -->
            <mat-step [stepControl]="doctorFormGroup" label="Select Doctor">
              <form [formGroup]="doctorFormGroup">
                <div class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Search by Specialization</mat-label>
                    <input
                      matInput
                      (input)="filterDoctors($event)"
                      placeholder="e.g., Cardiology, Dermatology"
                    />
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="doctors-grid" *ngIf="filteredDoctors.length > 0">
                    <mat-card
                      *ngFor="let doctor of filteredDoctors"
                      class="doctor-card"
                      [class.selected]="selectedDoctor?.id === doctor.id"
                      (click)="selectDoctor(doctor)"
                    >
                      <mat-card-content>
                        <div class="doctor-info">
                          <h3>
                            Dr. {{ doctor.user.first_name }}
                            {{ doctor.user.last_name }}
                          </h3>
                          <p class="specialization">
                            {{ doctor.specialization }}
                          </p>
                          <p class="experience">
                            {{ doctor.experience_years }} years experience
                          </p>
                          <mat-chip-set *ngIf="doctor.is_available">
                            <mat-chip color="accent">Available</mat-chip>
                          </mat-chip-set>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <div
                    class="empty-state"
                    *ngIf="filteredDoctors.length === 0 && !loadingDoctors"
                  >
                    <mat-icon>local_hospital</mat-icon>
                    <p>No doctors found. Try a different specialization.</p>
                  </div>

                  <div class="loading-container" *ngIf="loadingDoctors">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Loading doctors...</p>
                  </div>
                </div>

                <div class="step-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="!selectedDoctor"
                    matStepperNext
                  >
                    Next: Select Date & Time
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Select Date and Time -->
            <mat-step [stepControl]="appointmentFormGroup" label="Date & Time">
              <form [formGroup]="appointmentFormGroup">
                <div class="step-content">
                  <div class="selected-doctor-info" *ngIf="selectedDoctor">
                    <h3>Selected Doctor</h3>
                    <p>
                      <strong
                        >Dr. {{ selectedDoctor.user?.first_name }}
                        {{ selectedDoctor.user?.last_name }}</strong
                      >
                    </p>
                    <p>{{ selectedDoctor.specialization }}</p>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Appointment Date</mat-label>
                    <input
                      matInput
                      [matDatepicker]="picker"
                      formControlName="appointment_date"
                      [min]="minDate"
                      (dateChange)="onDateChange($event)"
                    />
                    <mat-datepicker-toggle
                      matIconSuffix
                      [for]="picker"
                    ></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error
                      *ngIf="
                        appointmentFormGroup
                          .get('appointment_date')
                          ?.hasError('required')
                      "
                    >
                      Please select an appointment date
                    </mat-error>
                  </mat-form-field>

                  <div class="time-slots" *ngIf="availableTimeSlots.length > 0">
                    <h4>Available Time Slots</h4>
                    <div class="time-grid">
                      <button
                        *ngFor="let slot of availableTimeSlots"
                        type="button"
                        mat-stroked-button
                        [class.selected]="selectedTime === slot"
                        (click)="selectTime(slot)"
                      >
                        {{ slot }}
                      </button>
                    </div>
                  </div>

                  <div
                    class="empty-state"
                    *ngIf="selectedDate && availableTimeSlots.length === 0"
                  >
                    <mat-icon>schedule</mat-icon>
                    <p>
                      No available time slots for the selected date. Please
                      choose another date.
                    </p>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="!selectedTime"
                    matStepperNext
                  >
                    Next: Appointment Details
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Appointment Details -->
            <mat-step [stepControl]="detailsFormGroup" label="Details">
              <form [formGroup]="detailsFormGroup">
                <div class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Appointment Type</mat-label>
                    <mat-select formControlName="appointment_type">
                      <mat-option value="consultation">Consultation</mat-option>
                      <mat-option value="follow_up">Follow Up</mat-option>
                      <mat-option value="routine_checkup"
                        >Routine Checkup</mat-option
                      >
                      <mat-option value="emergency">Emergency</mat-option>
                    </mat-select>
                    <mat-error
                      *ngIf="
                        detailsFormGroup
                          .get('appointment_type')
                          ?.hasError('required')
                      "
                    >
                      Please select appointment type
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason for Visit</mat-label>
                    <input
                      matInput
                      formControlName="reason"
                      placeholder="Brief description of your concern"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Additional Notes (Optional)</mat-label>
                    <textarea
                      matInput
                      rows="4"
                      formControlName="notes"
                      placeholder="Any additional information you'd like the doctor to know"
                    ></textarea>
                  </mat-form-field>

                  <!-- Appointment Summary -->
                  <div class="appointment-summary">
                    <h4>Appointment Summary</h4>
                    <div class="summary-item">
                      <span class="label">Doctor:</span>
                      <span
                        >Dr. {{ selectedDoctor?.user?.first_name }}
                        {{ selectedDoctor?.user?.last_name }}</span
                      >
                    </div>
                    <div class="summary-item">
                      <span class="label">Specialization:</span>
                      <span>{{ selectedDoctor?.specialization }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Date:</span>
                      <span>{{ formatDate(selectedDate) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Time:</span>
                      <span>{{ selectedTime }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Type:</span>
                      <span>{{
                        detailsFormGroup.get("appointment_type")?.value
                          | titlecase
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="!detailsFormGroup.valid || booking"
                    (click)="bookAppointment()"
                  >
                    <mat-spinner diameter="20" *ngIf="booking"></mat-spinner>
                    <span *ngIf="!booking">Book Appointment</span>
                    <span *ngIf="booking">Booking...</span>
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .book-appointment-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .booking-card {
        padding: 20px;
      }

      .step-content {
        padding: 20px 0;
        min-height: 300px;
      }

      .doctors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }

      .doctor-card {
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }

      .doctor-card:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .doctor-card.selected {
        border-color: #3f51b5;
        background-color: rgba(63, 81, 181, 0.05);
      }

      .doctor-info h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .doctor-info p {
        margin: 4px 0;
        color: #666;
      }

      .specialization {
        font-weight: 500;
        color: #3f51b5;
      }

      .fee {
        font-weight: 500;
        color: #4caf50;
      }

      .selected-doctor-info {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .selected-doctor-info h3 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .time-slots h4 {
        margin: 20px 0 12px 0;
        color: #333;
      }

      .time-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
      }

      .time-grid button {
        padding: 12px 8px;
      }

      .time-grid button.selected {
        background-color: #3f51b5;
        color: white;
      }

      .appointment-summary {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
      }

      .appointment-summary h4 {
        margin: 0 0 16px 0;
        color: #333;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;
      }

      .summary-item:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .fee-amount {
        font-weight: bold;
        color: #4caf50;
        font-size: 1.1em;
      }

      .step-actions {
        display: flex;
        justify-content: space-between;
        padding-top: 20px;
        margin-top: 20px;
        border-top: 1px solid #e0e0e0;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #666;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        gap: 16px;
      }

      @media (max-width: 600px) {
        .book-appointment-container {
          padding: 10px;
        }

        .doctors-grid {
          grid-template-columns: 1fr;
        }

        .time-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .step-actions {
          flex-direction: column;
          gap: 12px;
        }

        .step-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class BookAppointmentComponent implements OnInit {
  doctorFormGroup: FormGroup;
  appointmentFormGroup: FormGroup;
  detailsFormGroup: FormGroup;

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;

  minDate = new Date();
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  availableTimeSlots: string[] = [];

  loadingDoctors = false;
  booking = false;

  appointmentTypes = [
    { value: "consultation", label: "Consultation" },
    { value: "follow_up", label: "Follow Up" },
    { value: "routine_checkup", label: "Routine Checkup" },
    { value: "emergency", label: "Emergency" },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.doctorFormGroup = this.fb.group({
      selectedDoctor: ["", Validators.required],
    });

    this.appointmentFormGroup = this.fb.group({
      appointment_date: ["", Validators.required],
      appointment_time: ["", Validators.required],
    });

    this.detailsFormGroup = this.fb.group({
      appointment_type: ["", Validators.required],
      reason: [""],
      notes: [""],
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.doctorService.getAllDoctors(undefined, true).subscribe({
      next: ({ data }) => {
        this.doctors = data.doctors;
        this.filteredDoctors = data.doctors;
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error("Error loading doctors:", error);
        this.snackBar.open(
          "Error loading doctors. Please try again.",
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
        this.loadingDoctors = false;
      },
    });
  }

  filterDoctors(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredDoctors = this.doctors;
    } else {
      this.filteredDoctors = this.doctors.filter(
        (doctor) =>
          doctor.specialization.toLowerCase().includes(searchTerm) ||
          doctor.user.first_name.toLowerCase().includes(searchTerm) ||
          doctor.user.last_name.toLowerCase().includes(searchTerm)
      );
    }
  }

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.doctorFormGroup.patchValue({ selectedDoctor: doctor.id });
  }

  onDateChange(event: any): void {
    this.selectedDate = event.value;
    this.selectedTime = null;
    this.appointmentFormGroup.patchValue({ appointment_time: "" });

    if (this.selectedDate && this.selectedDoctor) {
      this.loadAvailableTimeSlots();
    }
  }

  loadAvailableTimeSlots(): void {
    if (!this.selectedDoctor || !this.selectedDate) return;

    const dateString = this.selectedDate.toISOString().split("T")[0];
    const dayOfWeek = this.getDayInString(dateString);

    this.doctorService
      .getDoctorAvailability(this.selectedDoctor.id, dateString)
      .subscribe({
        next: ({ data: availability }) => {
          this.availableTimeSlots = this.generateTimeSlots(
            availability,
            dayOfWeek
          );
        },
        error: (error) => {
          console.error("Error loading availability:", error);
          this.availableTimeSlots = [];
        },
      });
  }

  generateTimeSlots(
    availability: DoctorAvailability[],
    dayOfWeek: string
  ): string[] {
    console.log("Generating time slots for day:", dayOfWeek);
    const dayAvailability = availability.find(
      (av) => av.day_of_week === dayOfWeek && av.is_available
    );

    if (!dayAvailability) {
      return [];
    }

    const slots: string[] = [];
    const startTime = this.parseTime(dayAvailability.start_time);
    const endTime = this.parseTime(dayAvailability.end_time);

    let current = new Date(startTime);

    while (current < endTime) {
      slots.push(this.formatTime(current));
      current.setMinutes(current.getMinutes() + 30); // 30-minute slots
    }

    return slots;
  }

  parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.appointmentFormGroup.patchValue({ appointment_time: time });
  }

  formatDate(date: Date | null): string {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  bookAppointment(): void {
    if (
      !this.selectedDoctor ||
      !this.selectedDate ||
      !this.selectedTime ||
      !this.detailsFormGroup.valid
    ) {
      return;
    }

    this.booking = true;

    const appointmentData: CreateAppointment = {
      doctor_id: this.selectedDoctor.id,
      appointment_date: this.selectedDate.toISOString().split("T")[0],
      appointment_time: this.convertTo24Hour(this.selectedTime),
      appointment_type: this.detailsFormGroup.get("appointment_type")
        ?.value as AppointmentType,
      reason: this.detailsFormGroup.get("reason")?.value || undefined,
      notes: this.detailsFormGroup.get("notes")?.value || undefined,
      duration: 30,
    };

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (appointment) => {
        this.booking = false;
        this.snackBar.open("Appointment booked successfully!", "Close", {
          duration: 5000,
          panelClass: ["success-snackbar"],
        });
        this.router.navigate(["/appointments"]);
      },
      error: (error) => {
        this.booking = false;
        const errorMessage =
          error.error?.message ||
          "Failed to book appointment. Please try again.";
        this.snackBar.open(errorMessage, "Close", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  convertTo24Hour(time: string): string {
    const [timeStr, period] = time.split(" ");
    let [hours, minutes] = timeStr.split(":");

    if (period === "PM" && hours !== "12") {
      hours = (parseInt(hours) + 12).toString();
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  getDayInString(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day); // mes empieza desde 0

    const dayOfWeek = currentDate
      .toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "America/Lima", // o tu zona deseada
      })
      .toLowerCase();

    return dayOfWeek;
  }
}
