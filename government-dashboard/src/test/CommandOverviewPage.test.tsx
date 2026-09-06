import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommandOverviewPage } from '../pages/CommandOverviewPage';
import { diseaseService } from '../core/api/diseaseService';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getOutbreakStatistics: vi.fn(),
    listOutbreaks: vi.fn(),
    getDiseaseAnalytics: vi.fn(),
    listReports: vi.fn(),
  },
}));

describe('CommandOverviewPage with Live Embedded GIS Map', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('renders KPI strip, live embedded GIS map, and surveillance table', async () => {
    (diseaseService.getOutbreakStatistics as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      totalOutbreaks: 10,
      activeOutbreaks: 5,
      resolvedOutbreaks: 5,
      highRiskOutbreaks: 2,
    });

    (diseaseService.listOutbreaks as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 'ob-123',
        diseaseName: 'Foot-and-Mouth Disease',
        severity: 'HIGH',
        status: 'ACTIVE',
        riskScore: 'CRITICAL',
        centerLatitude: 18.15,
        centerLongitude: 74.57,
        radiusKm: 5.0,
        affectedReportsCount: 8,
        evaluationWindowHours: 24,
        lastCaseReportedAt: '2026-08-29T10:00:00Z',
        createdAt: '2026-08-29T08:00:00Z',
        updatedAt: '2026-08-29T10:00:00Z',
        compositeRiskScore: 88,
        riskBreakdown: null,
      },
    ]);

    (diseaseService.getDiseaseAnalytics as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      totalOutbreaks: 10,
      activeOutbreaks: 5,
      resolvedOutbreaks: 5,
      highRiskOutbreaks: 2,
      averageResolutionTimeHours: 36,
      diseaseDistribution: {},
      mostCommonDiseases: [],
      reportsByConfidenceSource: { VETERINARIAN: 15, LAB_CONFIRMED: 5, AI_VERIFIED: 8, GOVERNMENT: 2 },
    });

    (diseaseService.listReports as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CommandOverviewPage />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('command-overview-page')).toBeInTheDocument();
    expect(screen.getByText('Statewide Epidemiological Surveillance Command Overview')).toBeInTheDocument();
    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
    expect(screen.getByTestId('priority-alert-rail')).toBeInTheDocument();
    expect(screen.getByTestId('recent-surveillance-table')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Foot-and-Mouth Disease')).toBeInTheDocument();
    });
  });
});
