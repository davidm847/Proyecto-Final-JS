import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  Doctor,
  DoctorProfileUpdate,
  DoctorAvailability,
  SetAvailability,
  DoctorStats,
} from "../models/doctor.model";
import { Appointment } from "../models/appointment.model";
import { HttpClientResponse } from "../models/user.model";

interface PaginatedResponse<T> {
  doctors: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

@Injectable({
  providedIn: "root",
})
export class DoctorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAllDoctors(
    specialization?: string,
    available?: boolean
  ): Observable<HttpClientResponse<PaginatedResponse<Doctor>>> {
    let params = new HttpParams();
    if (specialization) {
      params = params.set("specialization", specialization);
    }
    if (available !== undefined) {
      params = params.set("available", available.toString());
    }
    return this.http.get<HttpClientResponse<PaginatedResponse<Doctor>>>(
      `${this.apiUrl}/doctors`,
      { params }
    );
  }

  getDoctorById(id: number): Observable<HttpClientResponse<Doctor>> {
    return this.http.get<HttpClientResponse<Doctor>>(
      `${this.apiUrl}/doctors/${id}`
    );
  }

  getDoctorAvailability(
    id: number,
    date?: string
  ): Observable<HttpClientResponse<DoctorAvailability[]>> {
    let params = new HttpParams();
    if (date) {
      params = params.set("date", date);
    }
    return this.http.get<HttpClientResponse<DoctorAvailability[]>>(
      `${this.apiUrl}/doctors/${id}/availability`,
      { params }
    );
  }

  updateDoctorProfile(
    profileData: DoctorProfileUpdate
  ): Observable<HttpClientResponse<Doctor>> {
    return this.http.put<HttpClientResponse<Doctor>>(
      `${this.apiUrl}/doctors/profile`,
      profileData
    );
  }

  setAvailability(
    availabilityData: SetAvailability[]
  ): Observable<HttpClientResponse<DoctorAvailability[]>> {
    return this.http.post<HttpClientResponse<DoctorAvailability[]>>(
      `${this.apiUrl}/doctors/availability`,
      { availability: availabilityData }
    );
  }

  getMyAvailability(): Observable<HttpClientResponse<DoctorAvailability[]>> {
    return this.http.get<HttpClientResponse<DoctorAvailability[]>>(
      `${this.apiUrl}/doctors/availability/me`
    );
  }

  getMyAppointments(): Observable<HttpClientResponse<Appointment[]>> {
    return this.http.get<HttpClientResponse<Appointment[]>>(
      `${this.apiUrl}/doctors/appointments/me`
    );
  }

  getDoctorStats(): Observable<HttpClientResponse<DoctorStats>> {
    return this.http.get<HttpClientResponse<DoctorStats>>(
      `${this.apiUrl}/doctors/stats/me`
    );
  }
}
