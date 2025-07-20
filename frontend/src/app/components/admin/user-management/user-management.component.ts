import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
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

import { UserService } from "../../../services/user.service";
import { User } from "../../../models/user.model";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-user-management",
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
  ],
  template: `
    <div class="user-management-container">
      <mat-card class="management-card">
        <mat-card-header>
          <mat-card-title>User Management</mat-card-title>
          <mat-card-subtitle
            >Manage all user accounts within the system</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-section">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Role</mat-label>
                <mat-select
                  formControlName="role"
                  (selectionChange)="onFilterChange()"
                >
                  <mat-option value="">All Roles</mat-option>
                  <mat-option value="admin">Admin</mat-option>
                  <mat-option value="doctor">Doctor</mat-option>
                  <mat-option value="patient">Patient</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Search</mat-label>
                <input
                  matInput
                  formControlName="search"
                  (input)="onFilterChange()"
                  placeholder="Search by name or email"
                />
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

          <div class="loading-container" *ngIf="loading">
            <mat-spinner></mat-spinner>
            <p>Loading users...</p>
          </div>

          <div class="table-container" *ngIf="!loading">
            <table
              mat-table
              [dataSource]="filteredUsers"
              class="users-table"
              matSort
              matSortActive="name"
              matSortDirection="asc"
            >
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div class="name-cell">
                    <div class="name">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="email">{{ user.email }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip class="role-chip">{{
                    user.role | titlecase
                  }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionsMenu="matMenu">
                    <button mat-menu-item (click)="viewUser(user)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-menu-item (click)="editUser(user)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button
                      mat-menu-item
                      *ngIf="canDeactivate(user)"
                      (click)="deactivateUser(user)"
                    >
                      <mat-icon>block</mat-icon>
                      Deactivate
                    </button>
                    <button
                      mat-menu-item
                      *ngIf="!canDeactivate(user)"
                      (click)="activateUser(user)"
                    >
                      <mat-icon>check_circle</mat-icon>
                      Activate
                    </button>
                    <button mat-menu-item (click)="deleteUser(user)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <mat-paginator
              [length]="totalUsers"
              [pageSize]="10"
              [pageSizeOptions]="[5, 10, 20]"
              showFirstLastButtons
            ></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .user-management-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .management-card {
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
        min-width: 200px;
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

      .users-table {
        width: 100%;
        min-width: 800px;
      }

      .name-cell {
        display: flex;
        flex-direction: column;
      }

      .name {
        font-weight: 500;
        color: #333;
      }

      .email {
        font-size: 0.875rem;
        color: #666;
      }

      .role-chip {
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .user-management-container {
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

        .users-table {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;

  filterForm: FormGroup;
  displayedColumns: string[] = ["name", "role", "actions"];
  totalUsers = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      role: [""],
      search: [""],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: ({ data: response }) => {
        this.users = response.users;
        this.totalUsers = response.pagination.total;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading users:", error);
        this.snackBar.open("Error loading users. Please try again.", "Close", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        });
        this.loading = false;
      },
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.filteredUsers = this.users.filter(
      (user) =>
        (!filters.role || user.role === filters.role) &&
        (!filters.search ||
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  viewUser(user: User): void {
    console.log("View user:", user);
  }

  editUser(user: User): void {
    console.log("Edit user:", user);
  }

  deactivateUser(user: User): void {
    if (confirm("Are you sure you want to deactivate this user?")) {
      this.userService.deactivateUser(user.id).subscribe({
        next: () => {
          this.snackBar.open("User deactivated successfully", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error("Error deactivating user:", error);
          this.snackBar.open(
            "Error deactivating user. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      });
    }
  }

  activateUser(user: User): void {
    if (confirm("Are you sure you want to activate this user?")) {
      this.userService.activateUser(user.id).subscribe({
        next: () => {
          this.snackBar.open("User activated successfully", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error("Error activating user:", error);
          this.snackBar.open(
            "Error activating user. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      });
    }
  }

  deleteUser(user: User): void {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open("User deleted successfully", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error("Error deleting user:", error);
          this.snackBar.open(
            "Error deleting user. Please try again.",
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            }
          );
        },
      });
    }
  }

  canDeactivate(user: User): boolean {
    return user.is_active;
  }
}
