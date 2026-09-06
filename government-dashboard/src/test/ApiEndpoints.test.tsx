import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../core/api/apiClient';
import { gisService } from '../core/api/gisService';
import { diseaseService } from '../core/api/diseaseService';
import { authService } from '../core/api/authService';
import { animalService } from '../core/api/animalService';

describe('API Client & Service Endpoint Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies apiClient default baseURL is configured as https://api.vetra.co.in/api/v1', () => {
    expect(['https://api.vetra.co.in/api/v1', '/api/v1']).toContain(apiClient.defaults.baseURL);
  });

  it('verifies gisService methods generate clean paths without /api/v1 duplication', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { success: true, data: [] } });

    // 1. Outbreaks GeoJSON
    await gisService.getOutbreaksGeoJson();
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/geojson');

    // 2. Heatmap Hotspots
    await gisService.getHeatmapData();
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/heatmap');

    // 3. Outbreaks list
    await gisService.getOutbreaks('ACTIVE');
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks', { params: { status: 'ACTIVE' } });

    // 4. High Risk Outbreaks
    await gisService.getHighRiskOutbreaks();
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/high-risk');

    // 5. Outbreak details by ID
    await gisService.getOutbreakById('outbreak-uuid-123');
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/outbreak-uuid-123');

    // 6. Outbreak reports by ID
    await gisService.getReportsForOutbreak('outbreak-uuid-123');
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/outbreak-uuid-123/reports');

    // 7. Recent Disease Reports
    await gisService.getRecentReports(0, 100);
    expect(getSpy).toHaveBeenLastCalledWith('/disease/reports', {
      params: { page: 0, size: 100, sort: 'createdAt,desc' },
    });
  });

  it('verifies diseaseService methods generate clean paths without /api/v1 duplication', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { success: true, data: [] } });

    await diseaseService.getOutbreakStatistics();
    expect(getSpy).toHaveBeenLastCalledWith('/disease/outbreaks/statistics');

    await diseaseService.getDiseaseAnalytics();
    expect(getSpy).toHaveBeenLastCalledWith('/disease/analytics');

    await diseaseService.getEconomicImpact();
    expect(getSpy).toHaveBeenLastCalledWith('/dashboard/economic-impact');
  });

  it('verifies authService methods generate clean paths without /api/v1 duplication', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { success: true, data: {} } });
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { success: true, data: {} } });

    await authService.login({ identifier: 'officer@vetra.gov.in', password: 'secretPassword123' });
    expect(postSpy).toHaveBeenLastCalledWith('/auth/login', {
      identifier: 'officer@vetra.gov.in',
      password: 'secretPassword123',
    });

    await authService.getCurrentUser();
    expect(getSpy).toHaveBeenLastCalledWith('/auth/me');

    await authService.listVets();
    expect(getSpy).toHaveBeenLastCalledWith('/auth/vets', { params: undefined });
  });

  it('verifies animalService methods generate clean paths without /api/v1 duplication', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { success: true, data: [] } });

    await animalService.listAnimals();
    expect(getSpy).toHaveBeenLastCalledWith('/animals');

    await animalService.getAnimalById('animal-123');
    expect(getSpy).toHaveBeenLastCalledWith('/animals/animal-123');
  });
});
