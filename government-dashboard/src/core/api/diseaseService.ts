import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { OutbreakResponse, OutbreakStatisticsResponse } from '../types/outbreak.types';
import { DiseaseAnalyticsResponse, EconomicImpactResponse } from '../types/analytics.types';
import { AIScreeningResponse, DiseaseMetadata, DiseaseReportResponse, Page } from '../types/disease.types';
import { VaccinationAnalyticsResponse } from '../types/vaccination.types';
import { OperationalAlertResponse } from '../types/alerts.types';

export const diseaseService = {
  async getOutbreakStatistics(): Promise<OutbreakStatisticsResponse> {
    const response = await apiClient.get<ApiResponse<OutbreakStatisticsResponse>>('/disease/outbreaks/statistics');
    return response.data.data;
  },

  async listOutbreaks(status?: string): Promise<OutbreakResponse[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get<ApiResponse<OutbreakResponse[]>>('/disease/outbreaks', { params });
    return response.data.data || [];
  },

  async getHighRiskOutbreaks(): Promise<OutbreakResponse[]> {
    const response = await apiClient.get<ApiResponse<OutbreakResponse[]>>('/disease/outbreaks/high-risk');
    return response.data.data || [];
  },

  async getDiseaseAnalytics(): Promise<DiseaseAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<DiseaseAnalyticsResponse>>('/disease/analytics');
    return response.data.data;
  },

  async listReports(page = 0, size = 20, sort = 'createdAt,desc'): Promise<Page<DiseaseReportResponse>> {
    const response = await apiClient.get<ApiResponse<Page<DiseaseReportResponse>>>('/disease/reports', {
      params: { page, size, sort },
    });
    return response.data.data;
  },

  async getReportById(id: string): Promise<DiseaseReportResponse> {
    const response = await apiClient.get<ApiResponse<DiseaseReportResponse>>(`/disease/reports/${id}`);
    return response.data.data;
  },

  async getOutbreak(id: string): Promise<OutbreakResponse> {
    const response = await apiClient.get<ApiResponse<OutbreakResponse>>(`/disease/outbreaks/${id}`);
    return response.data.data;
  },

  async getReportsForOutbreak(id: string): Promise<DiseaseReportResponse[]> {
    const response = await apiClient.get<ApiResponse<DiseaseReportResponse[]>>(`/disease/outbreaks/${id}/reports`);
    return response.data.data || [];
  },

  async getDiseaseRegistry(): Promise<DiseaseMetadata[]> {
    const response = await apiClient.get<ApiResponse<DiseaseMetadata[]>>('/disease/registry');
    return response.data.data || [];
  },

  async getVaccinationAnalytics(): Promise<VaccinationAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<VaccinationAnalyticsResponse>>('/disease/vaccination/analytics');
    return response.data.data;
  },

  async listOperationalAlerts(): Promise<OperationalAlertResponse[]> {
    const response = await apiClient.get<ApiResponse<OperationalAlertResponse[]>>('/disease/alerts');
    return response.data.data || [];
  },

  async getOperationalAlertById(id: string): Promise<OperationalAlertResponse> {
    const response = await apiClient.get<ApiResponse<OperationalAlertResponse>>(`/disease/alerts/${id}`);
    return response.data.data;
  },

  async listAIScreenings(veterinarianVerified?: boolean): Promise<AIScreeningResponse[]> {
    const params = veterinarianVerified !== undefined ? { veterinarianVerified } : {};
    const response = await apiClient.get<ApiResponse<AIScreeningResponse[]>>('/disease/ai-screenings', { params });
    return response.data.data || [];
  },

  async listAIScreeningsPaginated(page = 0, size = 20, veterinarianVerified?: boolean): Promise<Page<AIScreeningResponse>> {
    const params: Record<string, any> = { page, size, sort: 'createdAt,desc' };
    if (veterinarianVerified !== undefined) {
      params.veterinarianVerified = veterinarianVerified;
    }
    const response = await apiClient.get<ApiResponse<Page<AIScreeningResponse>>>('/disease/ai-screenings/page', { params });
    return response.data.data;
  },

  async getAIScreeningById(id: string): Promise<AIScreeningResponse> {
    const response = await apiClient.get<ApiResponse<AIScreeningResponse>>(`/disease/ai-screenings/${id}`);
    return response.data.data;
  },

  async getEconomicImpact(): Promise<EconomicImpactResponse> {
    const response = await apiClient.get<ApiResponse<EconomicImpactResponse>>('/dashboard/economic-impact');
    return response.data.data;
  },
};
