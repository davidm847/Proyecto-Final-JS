import { User } from './user.model';
import { Doctor } from './doctor.model';
import { Appointment } from './appointment.model';

export interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  visit_date: string;
  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications_prescribed?: string;
  follow_up_instructions?: string;
  vital_signs?: VitalSigns;
  lab_results?: string;
  notes?: string;
  next_appointment_recommended: boolean;
  patient: User;
  doctor: Doctor;
  appointment?: Appointment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecord {
  patient_id: number;
  appointment_id?: number;
  visit_date?: string;
  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications_prescribed?: string;
  follow_up_instructions?: string;
  vital_signs?: VitalSigns;
  lab_results?: string;
  notes?: string;
  next_appointment_recommended?: boolean;
}
