import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";

import { AuthService } from "../../../services/auth.service";
import { UserRegistration } from "../../../models/user.model";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title class="text-center">Register</mat-card-title>
          <mat-card-subtitle class="text-center"
            >Create your account</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <form
            [formGroup]="registerForm"
            (ngSubmit)="onSubmit()"
            class="register-form"
          >
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  formControlName="first_name"
                  placeholder="Enter your first name"
                />
                <mat-error
                  *ngIf="registerForm.get('first_name')?.hasError('required')"
                >
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  formControlName="last_name"
                  placeholder="Enter your last name"
                />
                <mat-error
                  *ngIf="registerForm.get('last_name')?.hasError('required')"
                >
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error
                *ngIf="registerForm.get('email')?.hasError('required')"
              >
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
              >
                <mat-icon>{{
                  hidePassword ? "visibility_off" : "visibility"
                }}</mat-icon>
              </button>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('required')"
              >
                Password is required
              </mat-error>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('minlength')"
              >
                Password must be at least 6 characters long
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="patient">Patient</mat-option>
                <mat-option value="doctor">Doctor</mat-option>
              </mat-select>
              <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>

            <!-- Doctor-specific fields -->
            <div
              *ngIf="registerForm.get('role')?.value === 'doctor'"
              class="doctor-fields"
            >
              <h3 class="section-title">Doctor Information</h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Medical License Number</mat-label>
                <input
                  matInput
                  formControlName="license_number"
                  placeholder="Enter your medical license number"
                />
                <mat-icon matSuffix>verified</mat-icon>
                <mat-error
                  *ngIf="
                    registerForm.get('license_number')?.hasError('required')
                  "
                >
                  License number is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Specialization</mat-label>
                <mat-select formControlName="specialization">
                  <mat-option value="Cardiology">Cardiology</mat-option>
                  <mat-option value="Dermatology">Dermatology</mat-option>
                  <mat-option value="Endocrinology">Endocrinology</mat-option>
                  <mat-option value="Gastroenterology"
                    >Gastroenterology</mat-option
                  >
                  <mat-option value="General Medicine"
                    >General Medicine</mat-option
                  >
                  <mat-option value="Gynecology">Gynecology</mat-option>
                  <mat-option value="Neurology">Neurology</mat-option>
                  <mat-option value="Oncology">Oncology</mat-option>
                  <mat-option value="Orthopedics">Orthopedics</mat-option>
                  <mat-option value="Pediatrics">Pediatrics</mat-option>
                  <mat-option value="Psychiatry">Psychiatry</mat-option>
                  <mat-option value="Radiology">Radiology</mat-option>
                  <mat-option value="Surgery">Surgery</mat-option>
                  <mat-option value="Urology">Urology</mat-option>
                </mat-select>
                <mat-error
                  *ngIf="
                    registerForm.get('specialization')?.hasError('required')
                  "
                >
                  Specialization is required
                </mat-error>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Years of Experience</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="experience_years"
                    placeholder="0"
                    min="0"
                  />
                  <mat-error
                    *ngIf="
                      registerForm.get('experience_years')?.hasError('required')
                    "
                  >
                    Experience is required
                  </mat-error>
                  <mat-error
                    *ngIf="
                      registerForm.get('experience_years')?.hasError('min')
                    "
                  >
                    Experience cannot be negative
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Consultation Fee ($)</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="consultation_fee"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <mat-error
                    *ngIf="
                      registerForm.get('consultation_fee')?.hasError('required')
                    "
                  >
                    Consultation fee is required
                  </mat-error>
                  <mat-error
                    *ngIf="
                      registerForm.get('consultation_fee')?.hasError('min')
                    "
                  >
                    Fee cannot be negative
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Education & Qualifications</mat-label>
                <textarea
                  matInput
                  formControlName="education"
                  placeholder="Enter your medical education and qualifications"
                  rows="3"
                ></textarea>
                <mat-error
                  *ngIf="registerForm.get('education')?.hasError('required')"
                >
                  Education information is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Professional Bio</mat-label>
                <textarea
                  matInput
                  formControlName="bio"
                  placeholder="Brief description of your experience and approach"
                  rows="3"
                ></textarea>
                <mat-error
                  *ngIf="registerForm.get('bio')?.hasError('required')"
                >
                  Professional bio is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone (Optional)</mat-label>
              <input
                matInput
                formControlName="phone"
                placeholder="Enter your phone number"
              />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Date of Birth (Optional)</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="date_of_birth"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Gender (Optional)</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">Male</mat-option>
                  <mat-option value="female">Female</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address (Optional)</mat-label>
              <textarea
                matInput
                formControlName="address"
                placeholder="Enter your address"
                rows="3"
              ></textarea>
              <mat-icon matSuffix>home</mat-icon>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!registerForm.valid || loading"
              class="full-width register-button"
            >
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Register</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center">
          <p>
            Already have an account?
            <a routerLink="/login" class="login-link">Login here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .register-card {
        width: 100%;
        max-width: 600px;
        padding: 20px;
      }

      .register-form {
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

      .register-button {
        margin-top: 16px;
        height: 48px;
        font-size: 16px;
      }

      .login-link {
        color: #3f51b5;
        text-decoration: none;
      }

      .login-link:hover {
        text-decoration: underline;
      }

      mat-card-title {
        font-size: 24px;
        margin-bottom: 8px;
      }

      mat-card-subtitle {
        color: #666;
        margin-bottom: 24px;
      }

      .doctor-fields {
        background-color: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
        border-left: 4px solid #3f51b5;
      }

      .section-title {
        margin: 0 0 16px 0;
        color: #3f51b5;
        font-size: 18px;
        font-weight: 500;
      }

      @media (max-width: 600px) {
        .form-row {
          flex-direction: column;
        }

        .register-card {
          padding: 16px;
        }
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      first_name: ["", [Validators.required, Validators.minLength(2)]],
      last_name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      role: ["", Validators.required],
      phone: [""],
      date_of_birth: [""],
      gender: [""],
      address: [""],
      // Doctor-specific fields
      license_number: [""],
      specialization: [""],
      experience_years: [""],
      consultation_fee: [""],
      education: [""],
      bio: [""],
    });

    // Watch for role changes to toggle doctor-specific validations
    this.registerForm.get("role")?.valueChanges.subscribe((role) => {
      this.toggleDoctorValidation(role === "doctor");
    });
  }

  private toggleDoctorValidation(isDoctor: boolean): void {
    const doctorFields = [
      "license_number",
      "specialization",
      "experience_years",
      "consultation_fee",
      "education",
      "bio",
    ];

    doctorFields.forEach((field) => {
      const control = this.registerForm.get(field);
      if (control) {
        if (isDoctor) {
          // Add required validation for doctor fields
          if (field === "license_number" || field === "specialization") {
            control.setValidators([Validators.required]);
          } else if (
            field === "experience_years" ||
            field === "consultation_fee"
          ) {
            control.setValidators([Validators.required, Validators.min(0)]);
          } else {
            control.setValidators([Validators.required]);
          }
        } else {
          // Clear validations for non-doctor users
          control.clearValidators();
          control.setValue("");
        }
        control.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/dashboard"]);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.loading) {
      this.loading = true;
      const registerData: UserRegistration = {
        ...this.registerForm.value,
        date_of_birth: this.registerForm.value.date_of_birth
          ? this.formatDate(this.registerForm.value.date_of_birth)
          : undefined,
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open("Registration successful!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage =
            error.error?.message || "Registration failed. Please try again.";
          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
