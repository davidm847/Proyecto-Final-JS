import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { roleGuard } from "./guards/role.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./components/auth/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./components/profile/profile.component").then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: "appointments",
    loadComponent: () =>
      import(
        "./components/appointments/appointment-list/appointment-list.component"
      ).then((m) => m.AppointmentListComponent),
    canActivate: [authGuard],
  },
  {
    path: "book-appointment",
    loadComponent: () =>
      import(
        "./components/appointments/book-appointment/book-appointment.component"
      ).then((m) => m.BookAppointmentComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: "patient" },
  },
  {
    path: "users",
    loadComponent: () =>
      import(
        "./components/admin/user-management/user-management.component"
      ).then((m) => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: "admin" },
  },
  {
    path: "availability",
    loadComponent: () =>
      import(
        "./components/doctor/availability-management/availability-management.component"
      ).then((m) => m.AvailabilityManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: "doctor" },
  },
  {
    path: "medical-records",
    loadComponent: () =>
      import(
        "./components/medical-records/medical-record-list/medical-record-list.component"
      ).then((m) => m.MedicalRecordListComponent),
    canActivate: [authGuard],
  },
  {
    path: "medical-history",
    loadComponent: () =>
      import(
        "./components/medical-records/patient-history/patient-history.component"
      ).then((m) => m.PatientHistoryComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: "patient" },
  },
  {
    path: "**",
    loadComponent: () =>
      import("./components/shared/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
  },
];
