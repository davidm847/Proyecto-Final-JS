import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, tap } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import {
  User,
  UserLogin,
  UserRegistration,
  AuthResponse,
  ChangePassword,
  UserProfileUpdate,
  HttpClientResponse,
} from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: UserLogin): Observable<HttpClientResponse<AuthResponse>> {
    return this.http
      .post<HttpClientResponse<AuthResponse>>(
        `${this.apiUrl}/auth/login`,
        credentials
      )
      .pipe(
        tap((response) => {
          const { data } = response;
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          this.currentUserSubject.next(data.user);
        })
      );
  }

  register(
    userData: UserRegistration
  ): Observable<HttpClientResponse<AuthResponse>> {
    return this.http
      .post<HttpClientResponse<AuthResponse>>(
        `${this.apiUrl}/auth/register`,
        userData
      )
      .pipe(
        tap((response) => {
          const { data } = response;
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          this.currentUserSubject.next(data.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    this.router.navigate(["/login"]);
  }

  getProfile(): Observable<HttpClientResponse<User>> {
    return this.http.get<HttpClientResponse<User>>(
      `${this.apiUrl}/auth/profile`
    );
  }

  updateProfile(
    profileData: UserProfileUpdate
  ): Observable<HttpClientResponse<User>> {
    return this.http
      .put<HttpClientResponse<User>>(`${this.apiUrl}/auth/profile`, profileData)
      .pipe(
        tap(({ data: user }) => {
          localStorage.setItem("user", JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  changePassword(passwordData: ChangePassword): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, passwordData);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }

  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "doctor";
  }

  isPatient(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "patient";
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
