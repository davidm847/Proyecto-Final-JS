import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  AppointmentStats,
  AppointmentStatus,
} from "../models/appointment.model";
import { HttpClientResponse } from "../models/user.model";

interface PaginatedResponse<T> {
  appointments: T[];
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
export class AppointmentService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createAppointment(
    appointmentData: CreateAppointment
  ): Observable<HttpClientResponse<Appointment>> {
    return this.http.post<HttpClientResponse<Appointment>>(
      `${this.apiUrl}/appointments`,
      appointmentData
    );
  }

  getAppointments(filters?: {
    status?: AppointmentStatus;
    date?: string;
    doctor_id?: number;
    patient_id?: number;
  }): Observable<HttpClientResponse<PaginatedResponse<Appointment>>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) {
        params = params.set("status", filters.status);
      }
      if (filters.date) {
        params = params.set("date", filters.date);
      }
      if (filters.doctor_id) {
        params = params.set("doctor_id", filters.doctor_id.toString());
      }
      if (filters.patient_id) {
        params = params.set("patient_id", filters.patient_id.toString());
      }
    }
    return this.http.get<HttpClientResponse<PaginatedResponse<Appointment>>>(
      `${this.apiUrl}/appointments`,
      {
        params,
      }
    );
  }

  getAppointmentById(id: number): Observable<HttpClientResponse<Appointment>> {
    return this.http.get<HttpClientResponse<Appointment>>(
      `${this.apiUrl}/appointments/${id}`
    );
  }

  updateAppointment(
    id: number,
    appointmentData: UpdateAppointment
  ): Observable<HttpClientResponse<Appointment>> {
    return this.http.put<HttpClientResponse<Appointment>>(
      `${this.apiUrl}/appointments/${id}`,
      appointmentData
    );
  }

  cancelAppointment(
    id: number,
    cancellation_reason?: string
  ): Observable<HttpClientResponse<any>> {
    const body = cancellation_reason ? { cancellation_reason } : {};
    return this.http.put<HttpClientResponse<any>>(
      `${this.apiUrl}/appointments/${id}/cancel`,
      body
    );
  }

  getAppointmentStats(): Observable<HttpClientResponse<AppointmentStats>> {
    return this.http.get<HttpClientResponse<AppointmentStats>>(
      `${this.apiUrl}/appointments/stats`
    );
  }
}
