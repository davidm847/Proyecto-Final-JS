export enum UserRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  PATIENT = "patient",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  is_active: boolean;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  // Doctor-specific fields
  license_number?: string;
  specialization?: string;
  experience_years?: number;
  consultation_fee?: number;
  education?: string;
  bio?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserProfileUpdate {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type HttpClientResponse<T> = {
  data: T;
  message: string;
  status: string;
};

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  roleDistribution: {
    admin: number;
    doctors: number;
    patients: number;
  };
  recent_registrations: number;
}
