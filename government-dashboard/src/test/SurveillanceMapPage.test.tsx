import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SurveillanceMapPage } from '../pages/SurveillanceMapPage';
import { gisService } from '../core/api/gisService';
import { OutbreakResponse } from '../core/types/outbreak.types';

vi.mock('../core/api/gisService', () => ({
  gisService: {
    getOutbreaks: vi.fn(),
    getRecentReports: vi.fn(),
    getHeatmapData: vi.fn(),
    getReportsForOutbreak: vi.fn(),
  },
}));

describe('SurveillanceMapPage Full-Screen GIS Command Center', () => {
  let queryClient: QueryClient;

  const mockOutbreaks: OutbreakResponse[] = [
    {
      id: 'outbreak-1-uuid',
      diseaseName: 'Foot and Mouth Disease',
      severity: 'HIGH',
      status: 'ACTIVE',
      riskScore: 'CRITICAL',
      compositeRiskScore: 88,
      centerLatitude: 18.1512,
      centerLongitude: 74.5772,
      radiusKm: 5.5,
      affectedReportsCount: 14,
      evaluationWindowHours: 72,
      lastCaseReportedAt: '2026-08-29T10:15:00Z',
      createdAt: '2026-08-28T09:00:00Z',
      updatedAt: '2026-08-29T10:15:00Z',
      riskBreakdown: {
        clusterScore: 92.0,
        weatherScore: 78.5,
        historyScore: 65.0,
        vaccinationGapScore: 84.0,
        weatherTemperature: 28.5,
        weatherHumidity: 82.0,
        weatherPrecipitation: 12.4,
        vaccinationCoveragePct: 42.5,
        riskExplanation: 'Critical risk in Baramati block',
        recommendedAction: 'Quarantine area',
      },
    },
    {
      id: 'outbreak-2-uuid',
      diseaseName: 'Lumpy Skin Disease',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      riskScore: 'MEDIUM',
      compositeRiskScore: 42,
      centerLatitude: 19.8762,
      centerLongitude: 75.3433,
      radiusKm: 8.0,
      affectedReportsCount: 6,
      evaluationWindowHours: 72,
      lastCaseReportedAt: '2026-08-29T08:00:00Z',
      createdAt: '2026-08-27T10:00:00Z',
      updatedAt: '2026-08-29T08:00:00Z',
      riskBreakdown: {
        clusterScore: 40.0,
        weatherScore: 50.0,
        historyScore: 35.0,
        vaccinationGapScore: 45.0,
        weatherTemperature: 26.0,
        weatherHumidity: 65.0,
        weatherPrecipitation: 0.0,
        vaccinationCoveragePct: 75.0,
        riskExplanation: 'Moderate vector activity',
        recommendedAction: 'Vector spraying',
      },
    },
  ];

  const mockReportsPage = {
    content: [
      {
        id: 'rep-1',
        animalId: 'anim-1',
        tagNumber: 'TAG-MH-9812',
        animalName: 'Gauri',
        medicalRecordId: null,
        aiScanId: null,
        reportedById: 'user-1',
        reportedByName: 'Dr. Patil',
        reportSource: 'DIRECT' as const,
        diagnosisConfidenceSource: 'VETERINARIAN' as const,
        diseaseName: 'Foot and Mouth Disease',
        diagnosisStatus: 'CONFIRMED' as const,
        latitude: 18.151,
        longitude: 74.578,
        notes: 'Confirmed by clinical examination.',
        createdAt: '2026-08-29T10:15:00Z',
        updatedAt: '2026-08-29T10:15:00Z',
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 100,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('renders GIS Surveillance Map header, filter bar, and live map canvas', async () => {
    (gisService.getOutbreaks as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockOutbreaks);
    (gisService.getRecentReports as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReportsPage);

    render(
      <QueryClientProvider client={queryClient}>
        <SurveillanceMapPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Live GIS Epidemiological Surveillance Map')).toBeInTheDocument();
    expect(screen.getByText('PostGIS RFC 7946 Stream')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2 Visible')).toBeInTheDocument();
    });

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
  });

  it('switches between interactive map and accessible ledger table view', async () => {
    (gisService.getOutbreaks as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockOutbreaks);
    (gisService.getRecentReports as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReportsPage);

    render(
      <QueryClientProvider client={queryClient}>
        <SurveillanceMapPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
    });

    // Switch to Accessible Table
    fireEvent.click(screen.getByRole('button', { name: /Accessible Table/i }));

    const ledger = screen.getByTestId('outbreak-accessible-list-view');
    expect(ledger).toBeInTheDocument();
    expect(within(ledger).getByText('Foot and Mouth Disease')).toBeInTheDocument();
    expect(within(ledger).getByText('Lumpy Skin Disease')).toBeInTheDocument();
  });

  it('filters outbreaks by risk level', async () => {
    (gisService.getOutbreaks as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockOutbreaks);
    (gisService.getRecentReports as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReportsPage);

    render(
      <QueryClientProvider client={queryClient}>
        <SurveillanceMapPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('2 Visible')).toBeInTheDocument();
    });

    // Filter by CRITICAL
    fireEvent.change(screen.getByLabelText(/Risk:/i), {
      target: { value: 'CRITICAL' },
    });

    await waitFor(() => {
      expect(screen.getByText('1 Visible')).toBeInTheDocument();
    });
  });

  it('handles backend API failure gracefully with retry option', async () => {
    (gisService.getOutbreaks as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error connecting to PostGIS')
    );
    (gisService.getRecentReports as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReportsPage);

    render(
      <QueryClientProvider client={queryClient}>
        <SurveillanceMapPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to Ingest Spatial Outbreak Telemetry')).toBeInTheDocument();
      expect(screen.getByText('Retry Ingestion')).toBeInTheDocument();
    });
  });
});
