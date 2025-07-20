import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  MedicalRecord,
  CreateMedicalRecord,
} from "../models/medical-record.model";
import { HttpClientResponse } from "../models/user.model";

interface PaginatedResponse<T> {
  records: T[];
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
export class MedicalRecordService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createMedicalRecord(
    recordData: CreateMedicalRecord
  ): Observable<HttpClientResponse<MedicalRecord>> {
    return this.http.post<HttpClientResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records`,
      recordData
    );
  }

  getMedicalRecords(
    patientId?: number,
    doctorId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<HttpClientResponse<PaginatedResponse<MedicalRecord>>> {
    let params = new HttpParams();
    if (patientId) {
      params = params.set("patient_id", patientId.toString());
    }
    if (doctorId) {
      params = params.set("doctor_id", doctorId.toString());
    }
    if (dateFrom) {
      params = params.set("date_from", dateFrom);
    }
    if (dateTo) {
      params = params.set("date_to", dateTo);
    }
    return this.http.get<HttpClientResponse<PaginatedResponse<MedicalRecord>>>(
      `${this.apiUrl}/medical-records`,
      {
        params,
      }
    );
  }

  getMedicalRecordById(
    id: number
  ): Observable<HttpClientResponse<MedicalRecord>> {
    return this.http.get<HttpClientResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records/${id}`
    );
  }

  updateMedicalRecord(
    id: number,
    recordData: CreateMedicalRecord
  ): Observable<HttpClientResponse<MedicalRecord>> {
    return this.http.put<HttpClientResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records/${id}`,
      recordData
    );
  }

  deleteMedicalRecord(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/medical-records/${id}`);
  }

  getPatientMedicalHistory(
    patientId: number
  ): Observable<HttpClientResponse<MedicalRecord[]>> {
    return this.http.get<HttpClientResponse<MedicalRecord[]>>(
      `${this.apiUrl}/medical-records/patient/${patientId}`
    );
  }
}
