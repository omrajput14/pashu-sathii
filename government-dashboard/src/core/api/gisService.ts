import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  GeoJsonFeatureCollection,
  HeatmapPoint,
  AdministrativeFeatureProperties,
} from '../types/gis.types';
import { OutbreakResponse, OutbreakStatus } from '../types/outbreak.types';
import { AIScreeningResponse, DiseaseReportResponse, Page } from '../types/disease.types';

export const gisService = {
  /**
   * Fetches active outbreak clusters as an RFC 7946 GeoJSON FeatureCollection.
   * Endpoint: GET /api/v1/disease/outbreaks/geojson
   */
  async getOutbreaksGeoJson(): Promise<GeoJsonFeatureCollection> {
    const response = await apiClient.get<ApiResponse<GeoJsonFeatureCollection>>(
      '/disease/outbreaks/geojson'
    );
    return response.data.data;
  },

  /**
   * Fetches spatial heatmap hotspot dataset with normalized intensity weights (0.0 to 1.0).
   * Endpoint: GET /api/v1/disease/outbreaks/heatmap
   */
  async getHeatmapData(): Promise<HeatmapPoint[]> {
    const response = await apiClient.get<ApiResponse<HeatmapPoint[]>>(
      '/disease/outbreaks/heatmap'
    );
    return response.data.data;
  },

  /**
   * Fetches real administrative boundary GeoJSON (State, Districts, Talukas).
   * Sourced directly from backend GeoJSON datasets.
   * Endpoint: GET /api/v1/geo/boundaries
   */
  async getAdministrativeBoundaries(
    level?: string,
    district?: string,
    state: string = 'Maharashtra'
  ): Promise<GeoJsonFeatureCollection<AdministrativeFeatureProperties>> {
    const response = await apiClient.get<
      ApiResponse<GeoJsonFeatureCollection<AdministrativeFeatureProperties>>
    >('/geo/boundaries', {
      params: {
        level: level || 'ALL',
        district: district && district !== 'ALL' ? district : undefined,
        state,
      },
    });
    return response.data.data;
  },

  /**
   * Fetches list of available Maharashtra districts extracted dynamically from the dataset.
   * Endpoint: GET /api/v1/geo/districts
   */
  async getDistricts(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/geo/districts');
    return response.data.data;
  },

  /**
   * Fetches active or historical outbreak clusters.
   * Endpoint: GET /api/v1/disease/outbreaks
   */
  async getOutbreaks(status?: OutbreakStatus): Promise<OutbreakResponse[]> {
    if (status) {
      const response = await apiClient.get<ApiResponse<OutbreakResponse[]>>(
        '/disease/outbreaks',
        { params: { status } }
      );
      return response.data.data;
    }
    const response = await apiClient.get<ApiResponse<OutbreakResponse[]>>(
      '/disease/outbreaks'
    );
    return response.data.data;
  },

  /**
   * Fetches high-risk outbreak clusters (HIGH or CRITICAL severity).
   * Endpoint: GET /api/v1/disease/outbreaks/high-risk
   */
  async getHighRiskOutbreaks(): Promise<OutbreakResponse[]> {
    const response = await apiClient.get<ApiResponse<OutbreakResponse[]>>(
      '/disease/outbreaks/high-risk'
    );
    return response.data.data;
  },

  /**
   * Fetches complete outbreak details by UUID.
   * Endpoint: GET /api/v1/disease/outbreaks/{id}
   */
  async getOutbreakById(id: string): Promise<OutbreakResponse> {
    const response = await apiClient.get<ApiResponse<OutbreakResponse>>(
      `/disease/outbreaks/${id}`
    );
    return response.data.data;
  },

  /**
   * Fetches recent disease reports page for GIS mapping.
   * Endpoint: GET /api/v1/disease/reports
   */
  async getRecentReports(page = 0, size = 100): Promise<Page<DiseaseReportResponse>> {
    const response = await apiClient.get<ApiResponse<Page<DiseaseReportResponse>>>(
      '/disease/reports',
      { params: { page, size, sort: 'createdAt,desc' } }
    );
    return response.data.data;
  },

  /**
   * Fetches all disease reports associated with a specific outbreak cluster.
   * Endpoint: GET /api/v1/disease/outbreaks/{id}/reports
   */
  async getReportsForOutbreak(
    outbreakId: string,
    page?: number,
    size?: number
  ): Promise<DiseaseReportResponse[]> {
    const url = `/disease/outbreaks/${outbreakId}/reports`;
    if (page !== undefined || size !== undefined) {
      const response = await apiClient.get<ApiResponse<DiseaseReportResponse[]>>(
        url,
        { params: { page, size } }
      );
      return response.data.data;
    }
    const response = await apiClient.get<ApiResponse<DiseaseReportResponse[]>>(url);
    return response.data.data;
  },

  /**
   * Fetches disease reports within a geographic radius.
   * Endpoint: GET /api/v1/disease/reports/nearby
   */
  async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm = 25
  ): Promise<DiseaseReportResponse[]> {
    const response = await apiClient.get<ApiResponse<DiseaseReportResponse[]>>(
      '/disease/reports/nearby',
      { params: { latitude, longitude, radiusKm } }
    );
    return response.data.data;
  },

  /**
   * Fetches AI preliminary screening scans for GIS early-warning overlay.
   * Endpoint: GET /api/v1/disease/ai-screenings
   */
  async getAIScreenings(veterinarianVerified?: boolean): Promise<AIScreeningResponse[]> {
    const params = veterinarianVerified !== undefined ? { veterinarianVerified } : {};
    const response = await apiClient.get<ApiResponse<AIScreeningResponse[]>>(
      '/disease/ai-screenings',
      { params }
    );
    return response.data.data || [];
  },
};
