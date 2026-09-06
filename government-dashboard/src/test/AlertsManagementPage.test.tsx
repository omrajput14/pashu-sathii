import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertsManagementPage } from '../pages/AlertsManagementPage';
import { diseaseService } from '../core/api/diseaseService';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    listOperationalAlerts: vi.fn(),
    listOutbreaks: vi.fn(),
  },
}));

const mockAlerts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    eventType: 'CRITICAL_OUTBREAK_DETECTED',
    title: 'Critical Outbreak Alert: Foot and Mouth Disease',
    diseaseName: 'Foot and Mouth Disease',
    location: 'Lat 19.076, Lng 72.877 (Radius 15.0 km)',
    latitude: 19.076,
    longitude: 72.877,
    severity: 'CRITICAL',
    compositeRiskScore: 88.0,
    vaccinationGapPct: 65.0,
    caseCount: 8,
    detectedAt: '2026-08-29T10:00:00Z',
    sourceEngine: 'MultiSignalRiskEngine',
    status: 'ACTIVE',
    whyThisMatters: 'Cluster risk score reached 88.0/100 with 8 active reports.',
    recommendedNextStep: 'Execute statutory bio-quarantine perimeter and dispatch rapid response team.',
    outbreakId: 'outbreak-123',
    reportId: null,
  },
];

const mockOutbreaks = [
  {
    id: 'outbreak-123',
    diseaseName: 'Foot and Mouth Disease',
    centerLatitude: 19.076,
    centerLongitude: 72.877,
    radiusKm: 15.0,
    status: 'ACTIVE',
    riskScore: 'CRITICAL',
    compositeRiskScore: 88,
    affectedReportsCount: 8,
    createdAt: '2026-08-29T10:00:00Z',
    riskBreakdown: {
      compositeRiskScore: 88,
      riskLevel: 'CRITICAL',
      clusterScore: 85,
      weatherScore: 80,
      historicalRiskScore: 75,
      vaccinationGapScore: 65.0,
      activeCasesInCluster: 8,
      weatherHumidity: 80.0,
      vaccinationCoveragePct: 35.0,
      recommendedAction: 'Execute statutory bio-quarantine perimeter.',
    },
  },
];

describe('AlertsManagementPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders operational alerts list and priority queue', async () => {
    vi.mocked(diseaseService.listOperationalAlerts).mockResolvedValue(mockAlerts as any);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AlertsManagementPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Operational Alerts & Critical Surveillance Events')
      ).toBeInTheDocument();
      expect(screen.getByText('Critical Outbreak Alert: Foot and Mouth Disease')).toBeInTheDocument();
      expect(screen.getByText('CRITICAL THREAT')).toBeInTheDocument();
      expect(screen.getByText(/Operational Priority Queue/i)).toBeInTheDocument();
    });
  });
});
