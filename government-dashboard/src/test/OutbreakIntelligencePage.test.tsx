import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OutbreakIntelligencePage } from '../pages/OutbreakIntelligencePage';
import { gisService } from '../core/api/gisService';
import { diseaseService } from '../core/api/diseaseService';

vi.mock('../core/api/gisService', () => ({
  gisService: {
    getOutbreaks: vi.fn(),
    getReportsForOutbreak: vi.fn(),
  },
}));

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getOutbreak: vi.fn(),
  },
}));

const mockOutbreaks = [
  {
    id: 'f8fb7f4a-6d4b-4df2-a5e2-6cf72c2195f1',
    diseaseName: 'Foot and Mouth Disease',
    centerLatitude: 18.5204,
    centerLongitude: 73.8567,
    radiusKm: 25.0,
    riskScore: 'HIGH',
    compositeRiskScore: 78,
    severity: 'HIGH',
    affectedReportsCount: 9,
    status: 'ACTIVE',
    createdAt: '2026-08-26T00:00:00Z',
    lastCaseReportedAt: '2026-08-28T12:00:00Z',
    riskBreakdown: null,
  },
];

describe('OutbreakIntelligencePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders outbreak comparison matrix in list mode', async () => {
    vi.mocked(gisService.getOutbreaks).mockResolvedValue(mockOutbreaks as any);

    render(
      <QueryClientProvider client={queryClient}>
        <OutbreakIntelligencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Outbreak Intelligence & Deep Dossier Analysis')).toBeInTheDocument();
      expect(screen.getAllByText('Foot and Mouth Disease').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#f8fb7f4a').length).toBeGreaterThan(0);
    });
  });

  it('renders deep dossier when initialOutbreakId is provided', async () => {
    vi.mocked(gisService.getOutbreaks).mockResolvedValue(mockOutbreaks as any);
    vi.mocked(diseaseService.getOutbreak).mockResolvedValue({
      ...mockOutbreaks[0],
      riskBreakdown: {
        compositeScore: 78,
        riskLevel: 'HIGH',
        clusterScore: 80,
        weatherScore: 70,
        historyScore: 60,
        vaccinationGapScore: 75,
        weatherTemperature: 28.5,
        weatherHumidity: 80.0,
        weatherPrecipitation: 5.0,
        vaccinationCoveragePct: 65.0,
        riskExplanation: 'Cluster in active corridor',
        recommendedAction: 'Ring vaccination advised',
      },
    } as any);
    vi.mocked(gisService.getReportsForOutbreak).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <OutbreakIntelligencePage initialOutbreakId="f8fb7f4a-6d4b-4df2-a5e2-6cf72c2195f1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Multi-Signal Risk Engine Decomposition (4-Signal Vector)')).toBeInTheDocument();
      expect(screen.getByText('Ring vaccination advised')).toBeInTheDocument();
    });
  });
});
