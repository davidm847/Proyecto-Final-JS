import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
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
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";

import { AuthService } from "../../services/auth.service";
import {
  User,
  UserProfileUpdate,
  ChangePassword,
} from "../../models/user.model";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatDividerModule,
    MatTabsModule,
  ],
  template: `
    <div class="profile-container container">
      <h1>My Profile</h1>

      <mat-tab-group class="profile-tabs">
        <mat-tab label="Personal Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
                <mat-card-subtitle
                  >Update your personal details</mat-card-subtitle
                >
              </mat-card-header>

              <mat-card-content>
                <form
                  [formGroup]="profileForm"
                  (ngSubmit)="updateProfile()"
                  class="profile-form"
                >
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="first_name" />
                      <mat-error
                        *ngIf="
                          profileForm.get('first_name')?.hasError('required')
                        "
                      >
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="last_name" />
                      <mat-error
                        *ngIf="
                          profileForm.get('last_name')?.hasError('required')
                        "
                      >
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone</mat-label>
                    <input matInput formControlName="phone" />
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Date of Birth</mat-label>
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
                      <mat-label>Gender</mat-label>
                      <mat-select formControlName="gender">
                        <mat-option value="male">Male</mat-option>
                        <mat-option value="female">Female</mat-option>
                        <mat-option value="other">Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea
                      matInput
                      formControlName="address"
                      rows="3"
                    ></textarea>
                    <mat-icon matSuffix>home</mat-icon>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="!profileForm.valid || profileLoading"
                    >
                      <mat-spinner
                        diameter="20"
                        *ngIf="profileLoading"
                      ></mat-spinner>
                      <span *ngIf="!profileLoading">Update Profile</span>
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Account Information">
          <div class="tab-content">
            <mat-card class="mb-16">
              <mat-card-header>
                <mat-card-title>Account Details</mat-card-title>
                <mat-card-subtitle
                  >View your account information</mat-card-subtitle
                >
              </mat-card-header>

              <mat-card-content *ngIf="currentUser">
                <div class="account-info">
                  <div class="info-item">
                    <strong>Email:</strong> {{ currentUser.email }}
                  </div>
                  <div class="info-item">
                    <strong>Role:</strong> {{ currentUser.role | titlecase }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong>
                    <span
                      [class]="
                        currentUser.is_active
                          ? 'status-active'
                          : 'status-inactive'
                      "
                    >
                      {{ currentUser.is_active ? "Active" : "Inactive" }}
                    </span>
                  </div>
                  <div class="info-item" *ngIf="currentUser.last_login">
                    <strong>Last Login:</strong>
                    {{ currentUser.last_login | date : "medium" }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Change Password</mat-card-title>
                <mat-card-subtitle
                  >Update your account password</mat-card-subtitle
                >
              </mat-card-header>

              <mat-card-content>
                <form
                  [formGroup]="passwordForm"
                  (ngSubmit)="changePassword()"
                  class="password-form"
                >
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input
                      matInput
                      [type]="hideCurrentPassword ? 'password' : 'text'"
                      formControlName="current_password"
                    />
                    <button
                      type="button"
                      mat-icon-button
                      matSuffix
                      (click)="hideCurrentPassword = !hideCurrentPassword"
                    >
                      <mat-icon>{{
                        hideCurrentPassword ? "visibility_off" : "visibility"
                      }}</mat-icon>
                    </button>
                    <mat-error
                      *ngIf="
                        passwordForm
                          .get('current_password')
                          ?.hasError('required')
                      "
                    >
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input
                      matInput
                      [type]="hideNewPassword ? 'password' : 'text'"
                      formControlName="new_password"
                    />
                    <button
                      type="button"
                      mat-icon-button
                      matSuffix
                      (click)="hideNewPassword = !hideNewPassword"
                    >
                      <mat-icon>{{
                        hideNewPassword ? "visibility_off" : "visibility"
                      }}</mat-icon>
                    </button>
                    <mat-error
                      *ngIf="
                        passwordForm.get('new_password')?.hasError('required')
                      "
                    >
                      New password is required
                    </mat-error>
                    <mat-error
                      *ngIf="
                        passwordForm.get('new_password')?.hasError('minlength')
                      "
                    >
                      Password must be at least 6 characters long
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="accent"
                      type="submit"
                      [disabled]="!passwordForm.valid || passwordLoading"
                    >
                      <mat-spinner
                        diameter="20"
                        *ngIf="passwordLoading"
                      ></mat-spinner>
                      <span *ngIf="!passwordLoading">Change Password</span>
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 24px;
      }

      .profile-tabs {
        margin-top: 24px;
      }

      .tab-content {
        padding: 24px 0;
      }

      .profile-form,
      .password-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .half-width {
        flex: 1;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
      }

      .account-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .info-item {
        display: flex;
        padding: 8px 0;
      }

      .info-item strong {
        min-width: 120px;
        margin-right: 16px;
      }

      .status-active {
        color: #4caf50;
        font-weight: 500;
      }

      .status-inactive {
        color: #f44336;
        font-weight: 500;
      }

      @media (max-width: 600px) {
        .form-row {
          flex-direction: column;
        }

        .profile-container {
          padding: 16px;
        }

        .info-item {
          flex-direction: column;
        }

        .info-item strong {
          margin-bottom: 4px;
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  profileLoading = false;
  passwordLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      first_name: ["", [Validators.required, Validators.minLength(2)]],
      last_name: ["", [Validators.required, Validators.minLength(2)]],
      phone: [""],
      date_of_birth: [""],
      gender: [""],
      address: [""],
    });

    this.passwordForm = this.fb.group({
      current_password: ["", Validators.required],
      new_password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Load current user data
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.loadUserData(user);
      }
    });

    // Refresh user profile from server
    this.refreshProfile();
  }

  private loadUserData(user: User): void {
    this.profileForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone ?? "",
      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : "",
      gender: user.gender ?? "",
      address: user.address ?? "",
    });
  }

  private refreshProfile(): void {
    this.authService.getProfile().subscribe({
      next: ({ data }) => {
        console.log("data", data);
        this.currentUser = data;
        this.loadUserData(data);
      },
      error: (error) => {
        console.error("Failed to load profile:", error);
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && !this.profileLoading) {
      this.profileLoading = true;
      const profileData: UserProfileUpdate = {
        ...this.profileForm.value,
        date_of_birth: this.profileForm.value.date_of_birth
          ? this.formatDate(this.profileForm.value.date_of_birth)
          : undefined,
      };

      this.authService.updateProfile(profileData).subscribe({
        next: ({ data }) => {
          this.profileLoading = false;
          this.currentUser = data;
          this.snackBar.open("Profile updated successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          this.profileLoading = false;
          const errorMessage =
            error.error?.message || "Failed to update profile.";
          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && !this.passwordLoading) {
      this.passwordLoading = true;
      const passwordData: ChangePassword = this.passwordForm.value;

      this.authService.changePassword(passwordData).subscribe({
        next: () => {
          this.passwordLoading = false;
          this.passwordForm.reset();
          this.snackBar.open("Password changed successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          this.passwordLoading = false;
          const errorMessage =
            error.error?.message || "Failed to change password.";
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
