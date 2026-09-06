import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EpidemiologicalAnalyticsPage } from '../pages/EpidemiologicalAnalyticsPage';
import { diseaseService } from '../core/api/diseaseService';
import { gisService } from '../core/api/gisService';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getDiseaseAnalytics: vi.fn(),
    getOutbreakStatistics: vi.fn(),
  },
}));

vi.mock('../core/api/gisService', () => ({
  gisService: {
    getOutbreaks: vi.fn(),
  },
}));

const mockAnalytics = {
  totalOutbreaks: 10,
  activeOutbreaks: 4,
  resolvedOutbreaks: 6,
  highRiskOutbreaks: 2,
  averageResolutionTimeHours: 48.5,
  diseaseDistribution: {
    'Foot and Mouth Disease': 20,
    'Lumpy Skin Disease': 15,
    'Brucellosis': 10,
  },
  mostCommonDiseases: ['Foot and Mouth Disease', 'Lumpy Skin Disease', 'Brucellosis'],
  reportsByConfidenceSource: {
    VETERINARIAN: 25,
    LAB_CONFIRMED: 6,
    AI_VERIFIED: 12,
    GOVERNMENT: 2,
  },
};

const mockStats = {
  totalOutbreaks: 10,
  activeOutbreaks: 4,
  resolvedOutbreaks: 6,
  highRiskOutbreaks: 2,
};

describe('EpidemiologicalAnalyticsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders all epidemiological charts and KPI bar', async () => {
    vi.mocked(diseaseService.getDiseaseAnalytics).mockResolvedValue(mockAnalytics as any);
    vi.mocked(diseaseService.getOutbreakStatistics).mockResolvedValue(mockStats as any);
    vi.mocked(gisService.getOutbreaks).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <EpidemiologicalAnalyticsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Epidemiological Surveillance Analytics')).toBeInTheDocument();
      expect(screen.getByText('Disease Prevalence & Spatial Distribution')).toBeInTheDocument();
      expect(screen.getAllByText('Foot and Mouth Disease').length).toBeGreaterThan(0);
      expect(screen.getByText('Diagnostic Verification Pipelines')).toBeInTheDocument();
      expect(screen.getByText('Licensed Field Veterinarians')).toBeInTheDocument();
      expect(screen.getAllByText('49h').length).toBeGreaterThan(0);
    });
  });
});
