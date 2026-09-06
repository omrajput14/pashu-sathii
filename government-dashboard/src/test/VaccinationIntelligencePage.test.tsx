import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaccinationIntelligencePage } from '../pages/VaccinationIntelligencePage';
import { diseaseService } from '../core/api/diseaseService';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getVaccinationAnalytics: vi.fn(),
  },
}));

const mockVaccinationData = {
  totalRegisteredLivestock: 1200,
  totalVaccinatedLivestock: 780,
  totalUnvaccinatedLivestock: 420,
  overallCoveragePercentage: 65.0,
  overallImmunityGapPercentage: 35.0,
  pathogenCoverage: [
    {
      diseaseName: 'Foot and Mouth Disease (FMD)',
      vaccinatedCount: 900,
      eligibleCount: 1200,
      coveragePercentage: 75.0,
      immunityGapPercentage: 25.0,
      targetCoveragePercentage: 80.0,
      status: 'DEFICIT',
    },
    {
      diseaseName: 'Lumpy Skin Disease (LSD)',
      vaccinatedCount: 1020,
      eligibleCount: 1200,
      coveragePercentage: 85.0,
      immunityGapPercentage: 15.0,
      targetCoveragePercentage: 80.0,
      status: 'ADEQUATE',
    },
  ],
  zoneVaccinationGaps: [
    {
      outbreakId: 'outbreak-uuid-1',
      zoneName: 'Pune Dairy Sector Alpha',
      diseaseName: 'Foot and Mouth Disease (FMD)',
      latitude: 18.5204,
      longitude: 73.8567,
      radiusKm: 15.0,
      totalAnimals: 450,
      vaccinatedAnimals: 225,
      coveragePercentage: 50.0,
      immunityGapPercentage: 50.0,
      riskLevel: 'CRITICAL',
    },
  ],
  priorityDeficitZones: [
    {
      outbreakId: 'outbreak-uuid-1',
      zoneName: 'Pune Dairy Sector Alpha',
      primaryDisease: 'Foot and Mouth Disease (FMD)',
      immunityGapPercentage: 50.0,
      outbreakRiskScore: 88.0,
      operationalPriority: 'URGENT_RING_VACCINATION',
      recommendedAction: 'Deploy emergency ring vaccination within 15 km buffer.',
    },
  ],
};

describe('VaccinationIntelligencePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders vaccination intelligence dashboard with KPI metrics and pathogen progress bars', async () => {
    vi.mocked(diseaseService.getVaccinationAnalytics).mockResolvedValue(mockVaccinationData as any);

    render(
      <QueryClientProvider client={queryClient}>
        <VaccinationIntelligencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Livestock Vaccination Intelligence & Regional Immunity Surveillance')
      ).toBeInTheDocument();
      expect(screen.getByText('1200')).toBeInTheDocument();
      expect(screen.getAllByText('Pune Dairy Sector Alpha').length).toBeGreaterThan(0);
      expect(screen.getByText('URGENT RING VACCINATION')).toBeInTheDocument();
    });
  });
});
