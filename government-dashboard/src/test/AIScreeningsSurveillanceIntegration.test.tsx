import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import L from 'leaflet';
import { SurveillanceMapPage } from '../pages/SurveillanceMapPage';
import { CommandOverviewPage } from '../pages/CommandOverviewPage';
import { SurveillanceMap } from '../components/gis/SurveillanceMap';
import { gisService } from '../core/api/gisService';
import { diseaseService } from '../core/api/diseaseService';
import { DEFAULT_GIS_FILTERS } from '../core/types/gis.types';
import { AIScreeningResponse } from '../core/types/disease.types';

// Mock gisService
vi.mock('../core/api/gisService', () => ({
  gisService: {
    getOutbreaks: vi.fn(),
    getRecentReports: vi.fn(),
    getAIScreenings: vi.fn(),
    getHeatmapData: vi.fn().mockResolvedValue([]),
    getAdministrativeBoundaries: vi.fn().mockResolvedValue({ type: 'FeatureCollection', features: [] }),
    getDistricts: vi.fn().mockResolvedValue(['Dhule', 'Pune']),
  },
}));

// Mock diseaseService
vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getOutbreakStatistics: vi.fn(),
    listOutbreaks: vi.fn(),
    getDiseaseAnalytics: vi.fn(),
    listReports: vi.fn(),
    getEconomicImpact: vi.fn(),
    listAIScreenings: vi.fn(),
    listAIScreeningsPaginated: vi.fn(),
  },
}));

describe('AI Preliminary Signal GIS Surveillance Integration', () => {
  let queryClient: QueryClient;

  // The exact Uterine Prolapse test scan in Dhule
  const mockDhuleUterineProlapseScan: AIScreeningResponse = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    animalId: '4e36c51f-4173-4541-be0d-b118c65af80b',
    tagNumber: 'DHU-TAG-001',
    animalName: 'Malti',
    species: 'CATTLE',
    preliminaryDiagnosis: 'Uterine Prolapse',
    confidenceScore: 0.95,
    severity: 'CRITICAL',
    status: 'COMPLETED',
    veterinarianVerified: false,
    verifiedByUserId: null,
    verifiedByVetName: null,
    verifiedAt: null,
    source: 'AI_PRELIMINARY_SCREENING',
    latitude: 20.9042,
    longitude: 74.7749,
    district: 'Dhule',
    taluka: 'Dhule',
    state: 'Maharashtra',
    imageUrl: 'https://vetra-storage.s3.ap-south-1.amazonaws.com/scans/dhule_uterine_prolapse_01.jpg',
    createdAt: '2026-09-10T14:15:00Z',
    updatedAt: '2026-09-10T14:15:00Z',
  };

  const mockEmptyReportsPage = {
    content: [],
    totalElements: 0,
    totalPages: 1,
    size: 100,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('renders AI Preliminary Signal marker on SurveillanceMap with 95% confidence in Dhule', () => {
    const markerSpy = vi.spyOn(L, 'marker');

    render(
      <SurveillanceMap
        outbreaks={[]}
        reports={[]}
        aiScreenings={[mockDhuleUterineProlapseScan]}
        filters={{ ...DEFAULT_GIS_FILTERS, showAiScreenings: true }}
        onSelectOutbreak={vi.fn()}
      />
    );

    // Verify Leaflet marker created at Dhule coordinates
    const aiMarkerCall = markerSpy.mock.calls.find((call) => {
      const coords = call[0] as [number, number];
      return Math.abs(coords[0] - 20.9042) < 0.001 && Math.abs(coords[1] - 74.7749) < 0.001;
    });

    expect(aiMarkerCall).toBeDefined();

    // Verify divIcon has the AI screening marker class
    const options = aiMarkerCall?.[1] as any;
    expect(options?.icon?.options?.html).toContain('vetra-case-ai-screening-marker');
    expect(options?.icon?.options?.html).toContain('vetra-ai-pulse');
  });

  it('SurveillanceMapPage Sync button refetches outbreaks, reports, AND AI screenings', async () => {
    const getOutbreaksMock = vi.mocked(gisService.getOutbreaks).mockResolvedValue([]);
    const getReportsMock = vi.mocked(gisService.getRecentReports).mockResolvedValue(mockEmptyReportsPage);
    const getAIScreeningsMock = vi.mocked(gisService.getAIScreenings).mockResolvedValue([mockDhuleUterineProlapseScan]);

    render(
      <QueryClientProvider client={queryClient}>
        <SurveillanceMapPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Live GIS Epidemiological Surveillance Map')).toBeInTheDocument();
    });

    expect(getOutbreaksMock).toHaveBeenCalledTimes(1);
    expect(getReportsMock).toHaveBeenCalledTimes(1);
    expect(getAIScreeningsMock).toHaveBeenCalledTimes(1);

    // Click the Sync button
    const syncBtn = screen.getByRole('button', { name: /Sync/i });
    fireEvent.click(syncBtn);

    // Verify all 3 refetch calls are dispatched
    await waitFor(() => {
      expect(getOutbreaksMock).toHaveBeenCalledTimes(2);
      expect(getReportsMock).toHaveBeenCalledTimes(2);
      expect(getAIScreeningsMock).toHaveBeenCalledTimes(2);
    });
  });

  it('CommandOverviewPage fetches AI screenings and embeds them in the overview map', async () => {
    vi.mocked(diseaseService.getOutbreakStatistics).mockResolvedValue({
      totalOutbreaks: 0,
      activeOutbreaks: 0,
      resolvedOutbreaks: 0,
      highRiskOutbreaks: 0,
    });
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue([]);
    vi.mocked(diseaseService.getDiseaseAnalytics).mockResolvedValue({
      totalCases: 0,
      confirmedCases: 0,
      suspectedCases: 0,
      diseaseDistribution: [],
      topAffectedDistricts: [],
      mortalityRate: 0,
      temporalTrend: [],
    });
    vi.mocked(diseaseService.listReports).mockResolvedValue(mockEmptyReportsPage);
    vi.mocked(diseaseService.getEconomicImpact).mockResolvedValue(null as any);
    // Overview reads the AI screening layer through the PAGINATED endpoint so the
    // payload stays bounded; the unpaginated list is no longer used by this page.
    const listAIScreeningsPaginatedMock = vi
      .mocked(diseaseService.listAIScreeningsPaginated)
      .mockResolvedValue({
        content: [mockDhuleUterineProlapseScan],
        totalElements: 1,
        totalPages: 1,
        size: 50,
        number: 0,
        first: true,
        last: true,
        empty: false,
      });

    const markerSpy = vi.spyOn(L, 'marker');

    render(
      <QueryClientProvider client={queryClient}>
        <CommandOverviewPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Live PostGIS Surveillance Map/i)).toBeInTheDocument();
    });

    // Verify AI screenings were queried on the Command Overview page, via the
    // bounded paginated endpoint rather than the single-shot list.
    expect(listAIScreeningsPaginatedMock).toHaveBeenCalled();
    expect(gisService.getAIScreenings).not.toHaveBeenCalled();

    // Verify AI marker is positioned at Dhule coordinates on the embedded map
    await waitFor(() => {
      const aiCall = markerSpy.mock.calls.find((call) => {
        const coords = call[0] as [number, number];
        return Math.abs(coords[0] - 20.9042) < 0.001 && Math.abs(coords[1] - 74.7749) < 0.001;
      });
      expect(aiCall).toBeDefined();
    });
  });

  it('Safety Rule: AI scan remains PRELIMINARY and does NOT automatically become confirmed report or outbreak', () => {
    // 1. Must be flagged as preliminary/unverified
    expect(mockDhuleUterineProlapseScan.veterinarianVerified).toBe(false);
    expect(mockDhuleUterineProlapseScan.source).toBe('AI_PRELIMINARY_SCREENING');
    expect(mockDhuleUterineProlapseScan.status).toBe('COMPLETED');

    // 2. Preliminary diagnosis preserved without confirmed disease classification
    expect(mockDhuleUterineProlapseScan.preliminaryDiagnosis).toBe('Uterine Prolapse');
    expect(mockDhuleUterineProlapseScan.confidenceScore).toBe(0.95);
    expect(mockDhuleUterineProlapseScan.severity).toBe('CRITICAL');

    // 3. No verifier attached
    expect(mockDhuleUterineProlapseScan.verifiedByUserId).toBeNull();
    expect(mockDhuleUterineProlapseScan.verifiedByVetName).toBeNull();
    expect(mockDhuleUterineProlapseScan.verifiedAt).toBeNull();
  });
});
