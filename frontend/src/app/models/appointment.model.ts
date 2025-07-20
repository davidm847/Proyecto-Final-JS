import { User } from "./user.model";
import { Doctor } from "./doctor.model";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOW_UP = "follow_up",
  EMERGENCY = "emergency",
  ROUTINE_CHECKUP = "routine_checkup",
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: AppointmentStatus;
  appointment_type: AppointmentType;
  reason?: string;
  notes?: string;
  reminder_sent: boolean;
  cancelled_by?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  patient: User;
  doctor: Doctor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointment {
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  duration?: number;
  appointment_type: AppointmentType;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointment {
  appointment_date?: string;
  appointment_time?: string;
  duration?: number;
  status?: AppointmentStatus;
  appointment_type?: AppointmentType;
  reason?: string;
  notes?: string;
}

export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
}
