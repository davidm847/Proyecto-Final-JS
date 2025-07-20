import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";

import { User, UserRole } from "../../../models/user.model";

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: "app-sidenav",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <nav class="sidenav-content">
      <div class="user-info" *ngIf="user">
        <mat-icon class="user-avatar">account_circle</mat-icon>
        <div class="user-details">
          <div class="user-name">
            {{ user.first_name }} {{ user.last_name }}
          </div>
          <div class="user-role">{{ user.role | titlecase }}</div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-nav-list class="nav-list">
        <ng-container *ngFor="let item of getVisibleMenuItems()">
          <mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </mat-list-item>
        </ng-container>
      </mat-nav-list>
    </nav>
  `,
  styles: [
    `
      .sidenav-content {
        padding: 0;
        height: 100%;
      }

      .user-info {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: #f5f5f5;
      }

      .user-avatar {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-right: 12px;
        color: #757575;
      }

      .user-details {
        flex: 1;
      }

      .user-name {
        font-weight: 500;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .user-role {
        color: #757575;
        font-size: 14px;
      }

      .nav-list {
        padding: 8px 0;
      }

      .active-link {
        background-color: rgba(63, 81, 181, 0.1) !important;
        color: #3f51b5 !important;
      }

      .active-link mat-icon {
        color: #3f51b5 !important;
      }

      mat-list-item {
        border-radius: 0 24px 24px 0;
        margin: 2px 8px 2px 0;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      mat-list-item:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    `,
  ],
})
export class SidenavComponent {
  @Input() user: User | null = null;

  menuItems: MenuItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: "dashboard" },
    { label: "Profile", route: "/profile", icon: "person" },
    // Patient menu items
    {
      label: "Book Appointment",
      route: "/book-appointment",
      icon: "add_circle",
      roles: [UserRole.PATIENT],
    },
    {
      label: "My Appointments",
      route: "/appointments",
      icon: "event",
      roles: [UserRole.PATIENT],
    },
    {
      label: "Medical History",
      route: "/medical-history",
      icon: "folder_shared",
      roles: [UserRole.PATIENT],
    },
    // Doctor menu items
    {
      label: "My Appointments",
      route: "/appointments",
      icon: "event",
      roles: [UserRole.DOCTOR],
    },
    {
      label: "Manage Availability",
      route: "/availability",
      icon: "schedule",
      roles: [UserRole.DOCTOR],
    },
    {
      label: "Medical Records",
      route: "/medical-records",
      icon: "folder_shared",
      roles: [UserRole.DOCTOR],
    },
    // Admin menu items
    {
      label: "All Appointments",
      route: "/appointments",
      icon: "event",
      roles: [UserRole.ADMIN],
    },
    {
      label: "User Management",
      route: "/users",
      icon: "group",
      roles: [UserRole.ADMIN],
    },
    {
      label: "Medical Records",
      route: "/medical-records",
      icon: "folder_shared",
      roles: [UserRole.ADMIN],
    },
  ];

  getVisibleMenuItems(): MenuItem[] {
    if (!this.user) return [];

    return this.menuItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) {
        return true; // Show items with no role restrictions
      }
      return item.roles.includes(this.user!.role);
    });
  }
}
