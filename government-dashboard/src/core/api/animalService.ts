import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { Page } from '../types/disease.types';

export interface AnimalRecord {
  id: string;
  farmerId: string;
  farmerName?: string;
  animalName?: string;
  tagNumber: string;
  qrCodeId?: string;
  species: string;
  breed?: string;
  gender: string;
  birthDate?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const animalService = {
  /**
   * Retrieves registered livestock animal records from Azure backend.
   * Endpoint: GET /api/v1/animals
   */
  async listAnimals(): Promise<AnimalRecord[]> {
    const response = await apiClient.get<ApiResponse<AnimalRecord[]>>('/animals');
    return response.data.data || [];
  },

  /**
   * Retrieves paginated livestock animal records.
   * Endpoint: GET /api/v1/animals/page
   */
  async listAnimalsPaginated(page = 0, size = 20, sort = 'createdAt,desc'): Promise<Page<AnimalRecord>> {
    const response = await apiClient.get<ApiResponse<Page<AnimalRecord>>>('/animals/page', {
      params: { page, size, sort },
    });
    return response.data.data;
  },

  /**
   * Retrieves details of a specific animal by UUID.
   * Endpoint: GET /api/v1/animals/{id}
   */
  async getAnimalById(id: string): Promise<AnimalRecord> {
    const response = await apiClient.get<ApiResponse<AnimalRecord>>(`/animals/${id}`);
    return response.data.data;
  },
};
