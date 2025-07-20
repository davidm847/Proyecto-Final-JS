import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  User,
  UserStats,
  UserProfileUpdate,
  UserRole,
  HttpClientResponse,
} from "../models/user.model";

interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: UserRole
  ): Observable<HttpClientResponse<PaginatedResponse<User>>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    if (role) {
      params = params.set("role", role);
    }

    return this.http.get<HttpClientResponse<PaginatedResponse<User>>>(
      `${this.apiUrl}/users`,
      {
        params,
      }
    );
  }

  getUserStats(): Observable<HttpClientResponse<UserStats>> {
    return this.http.get<HttpClientResponse<UserStats>>(
      `${this.apiUrl}/users/stats`
    );
  }

  getUserById(id: number): Observable<HttpClientResponse<User>> {
    return this.http.get<HttpClientResponse<User>>(
      `${this.apiUrl}/users/${id}`
    );
  }

  updateUser(
    id: number,
    userData: UserProfileUpdate
  ): Observable<HttpClientResponse<User>> {
    return this.http.put<HttpClientResponse<User>>(
      `${this.apiUrl}/users/${id}`,
      userData
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  activateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/activate`, {});
  }
}
