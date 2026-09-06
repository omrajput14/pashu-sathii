import { apiClient } from './apiClient';
import { ApiResponse, AuthResponse, LoginRequest, UserProfileDto } from '../types/auth.types';

export interface VetSummaryDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  registrationNumber?: string;
  qualification?: string;
  specialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  yearsExperience?: number;
  isAvailable?: boolean;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  async getCurrentUser(): Promise<UserProfileDto> {
    const response = await apiClient.get<ApiResponse<UserProfileDto>>('/auth/me');
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('vetra_gov_access_token');
      localStorage.removeItem('vetra_gov_refresh_token');
      localStorage.removeItem('vetra_gov_user');
    }
  },

  /**
   * Retrieves directory of verified registered veterinarians from Azure backend.
   * Endpoint: GET /api/v1/auth/vets
   */
  async listVets(params?: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    village?: string;
    taluka?: string;
    district?: string;
  }): Promise<VetSummaryDto[]> {
    const response = await apiClient.get<ApiResponse<VetSummaryDto[]>>('/auth/vets', { params });
    return response.data.data || [];
  },
};
