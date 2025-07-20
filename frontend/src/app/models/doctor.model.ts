import { User } from "./user.model";

export interface Doctor {
  id: number;
  user_id: number;
  license_number: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  education?: string;
  bio?: string;
  is_available: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfileUpdate {
  license_number?: string;
  specialization?: string;
  experience_years?: number;
  consultation_fee?: number;
  education?: string;
  bio?: string;
  is_available?: boolean;
}

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  day_of_week: string; // "monday", "tuesday", etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetAvailability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DoctorStats {
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  upcoming_appointments: number;
  total_patients: number;
  average_rating: number;
}
