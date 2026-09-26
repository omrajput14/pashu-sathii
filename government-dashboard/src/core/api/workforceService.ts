import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';

/** A vet or para-vet and what they have done. */
export interface WorkforceMember {
  userId: string;
  name: string;
  role: 'PARA_VET' | 'VETERINARIAN';
  district: string | null;
  taluka: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
  scansEscalated: number;
  scansClosed: number;
  casesConfirmed: number;
  scansRejected: number;
  dosesGiven: number;
}

export const workforceService = {
  async list(): Promise<WorkforceMember[]> {
    const response = await apiClient.get<ApiResponse<WorkforceMember[]>>('/workforce');
    return response.data.data || [];
  },

  async approve(userId: string): Promise<WorkforceMember> {
    const response = await apiClient.post<ApiResponse<WorkforceMember>>(`/workforce/para-vets/${userId}/approve`, {});
    return response.data.data;
  },

  async reject(userId: string): Promise<WorkforceMember> {
    const response = await apiClient.post<ApiResponse<WorkforceMember>>(`/workforce/para-vets/${userId}/reject`, {});
    return response.data.data;
  },
};
