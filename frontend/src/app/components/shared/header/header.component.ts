import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";

import { AuthService } from "../../../services/auth.service";
import { User } from "../../../models/user.model";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <button mat-icon-button (click)="menuToggle.emit()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">Medical Management System</span>

      <span class="spacer"></span>

      <div class="user-section" *ngIf="user">
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name"
            >{{ user.first_name }} {{ user.last_name }}</span
          >
          <mat-icon>keyboard_arrow_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .menu-button {
        margin-right: 16px;
      }

      .app-title {
        font-size: 1.2rem;
        font-weight: 500;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .user-section {
        display: flex;
        align-items: center;
      }

      .user-button {
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: none;
      }

      .user-name {
        margin: 0 4px;
      }

      @media (max-width: 768px) {
        .app-title {
          font-size: 1rem;
        }

        .user-name {
          display: none;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();

  constructor(private readonly authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
