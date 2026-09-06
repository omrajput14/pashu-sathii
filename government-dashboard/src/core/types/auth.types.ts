export type UserRole = 'FARMER' | 'VETERINARIAN' | 'ADMINISTRATOR' | 'GOVERNMENT_OFFICER';

export interface UserProfileDto {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  active: boolean;
  preferredLanguage: string | null;
  fullName: string | null;
  farmName?: string | null;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  animalCount?: number | null;
  registrationNumber?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  clinicName?: string | null;
  yearsExperience?: number | null;
  isAvailable?: boolean | null;
  emergencyAvailable?: boolean | null;
  shiftSchedule?: string | null;
  profilePhotoUrl?: string | null;
  certificateUrl?: string | null;
  clinicAddress?: string | null;
  certificateStatus?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfileDto;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}
