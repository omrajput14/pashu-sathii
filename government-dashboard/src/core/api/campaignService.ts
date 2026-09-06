import { apiClient } from './apiClient';
import {
  VaccinationCampaignDto,
  CreateVaccinationCampaignRequest,
  UpdateCampaignStatusRequest,
  CampaignStatisticsDto,
  VaccinationCampaignAuditLogDto,
  CampaignListParams,
} from '../types/campaign.types';

export const campaignService = {
  /**
   * Retrieves paginated vaccination campaigns filtered by status and/or district.
   * Real production API call - throws error on failure without silent mock fallback.
   */
  async listCampaigns(params: CampaignListParams = {}): Promise<{
    content: VaccinationCampaignDto[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/vaccination/campaigns', { params });
    const pageData = response.data?.data;
    return {
      content: pageData?.content || [],
      totalElements: pageData?.totalElements || 0,
      totalPages: pageData?.totalPages || 1,
    };
  },

  /**
   * Retrieves details of a specific campaign by ID.
   */
  async getCampaignById(id: string): Promise<VaccinationCampaignDto> {
    const response = await apiClient.get(`/vaccination/campaigns/${id}`);
    return response.data?.data;
  },

  /**
   * Launches a new vaccination campaign with idempotency protection.
   */
  async createCampaign(
    request: CreateVaccinationCampaignRequest,
    idempotencyKey?: string
  ): Promise<VaccinationCampaignDto> {
    const key = idempotencyKey || `vac-camp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const response = await apiClient.post('/vaccination/campaigns', request, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return response.data?.data;
  },

  /**
   * Transitions a campaign to a new lifecycle status (e.g. PLANNED -> ACTIVE -> COMPLETED).
   */
  async updateCampaignStatus(
    id: string,
    request: UpdateCampaignStatusRequest
  ): Promise<VaccinationCampaignDto> {
    const response = await apiClient.patch(`/vaccination/campaigns/${id}/status`, request);
    return response.data?.data;
  },

  /**
   * Retrieves summary statistics for regional vaccination operations.
   */
  async getStatistics(): Promise<CampaignStatisticsDto> {
    const response = await apiClient.get('/vaccination/campaigns/statistics');
    return response.data?.data;
  },

  /**
   * Retrieves all currently active vaccination campaigns.
   */
  async getActiveCampaigns(): Promise<VaccinationCampaignDto[]> {
    const response = await apiClient.get('/vaccination/campaigns/active');
    return response.data?.data || [];
  },

  /**
   * Retrieves immutable audit trail logs for a campaign.
   */
  async getAuditLogs(campaignId: string): Promise<VaccinationCampaignAuditLogDto[]> {
    const response = await apiClient.get(`/vaccination/campaigns/${campaignId}/audit-logs`);
    return response.data?.data || [];
  },
};
