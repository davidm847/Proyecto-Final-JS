import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { filter } from "rxjs/operators";

import { AuthService } from "./services/auth.service";
import { HeaderComponent } from "./components/shared/header/header.component";
import { SidenavComponent } from "./components/shared/sidenav/sidenav.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    HeaderComponent,
    SidenavComponent,
  ],
  template: `
    <div class="app-container">
      <ng-container *ngIf="showLayout">
        <app-header
          (menuToggle)="sidenav.toggle()"
          [user]="currentUser"
        ></app-header>

        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="side" opened class="sidenav">
            <app-sidenav [user]="currentUser"></app-sidenav>
          </mat-sidenav>

          <mat-sidenav-content class="main-content">
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </ng-container>

      <router-outlet *ngIf="!showLayout"></router-outlet>
    </div>
  `,
  styles: [
    `
      .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .sidenav-container {
        flex: 1;
      }

      .sidenav {
        width: 250px;
      }

      .main-content {
        padding: 20px;
      }

      @media (max-width: 768px) {
        .sidenav {
          width: 200px;
        }

        .main-content {
          padding: 10px;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = "Medical Management System";
  showLayout = true;
  currentUser: any = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Listen to route changes to determine when to show/hide layout
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEndEvent = event as NavigationEnd;
        const hideLayoutRoutes = ["/login", "/register"];
        this.showLayout = !hideLayoutRoutes.includes(navigationEndEvent.url);
      });
  }
}
