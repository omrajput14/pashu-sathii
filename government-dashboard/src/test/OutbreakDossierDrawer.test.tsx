import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OutbreakDossierDrawer } from '../components/gis/OutbreakDossierDrawer';
import { OutbreakResponse } from '../core/types/outbreak.types';
import { gisService } from '../core/api/gisService';

vi.mock('../core/api/gisService', () => ({
  gisService: {
    getReportsForOutbreak: vi.fn(),
  },
}));

describe('OutbreakDossierDrawer Component', () => {
  let queryClient: QueryClient;

  const mockOutbreak: OutbreakResponse = {
    id: 'f8fb7f4a-de19-4e3d-8300-9cf366ad90e8',
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
      riskExplanation:
        'High aerosol transmission risk in dense livestock corridor with low vaccination coverage.',
      recommendedAction:
        'Enforce 10km quarantine perimeter, restrict cattle transit, and initiate ring vaccination.',
    },
  };

  const mockReports = [
    {
      id: 'rep-001-uuid',
      animalId: 'anim-001',
      tagNumber: 'TAG-MH-9812',
      animalName: 'Gauri',
      medicalRecordId: null,
      aiScanId: null,
      reportedById: 'user-001',
      reportedByName: 'Dr. Patil',
      reportSource: 'DIRECT' as const,
      diagnosisConfidenceSource: 'VETERINARIAN' as const,
      diseaseName: 'Foot and Mouth Disease',
      diagnosisStatus: 'CONFIRMED' as const,
      latitude: 18.151,
      longitude: 74.578,
      notes: 'Severe oral lesions and salivation.',
      createdAt: '2026-08-29T10:15:00Z',
      updatedAt: '2026-08-29T10:15:00Z',
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    (gisService.getReportsForOutbreak as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockReports
    );
  });

  it('renders complete 4-signal risk breakdown and explainable action', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OutbreakDossierDrawer
          outbreak={mockOutbreak}
          onClose={vi.fn()}
          onNavigateToIntelligence={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('EPIDEMIOLOGICAL DOSSIER')).toBeInTheDocument();
    expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
    expect(screen.getByText('(88)')).toBeInTheDocument(); // Composite score in RiskBadge
    expect(screen.getByText('14 Cases')).toBeInTheDocument();

    // 4 Signals
    expect(screen.getByText(/1. Cluster Velocity & Density/i)).toBeInTheDocument();
    expect(screen.getByText('92/100')).toBeInTheDocument();

    expect(screen.getByText(/2. Vector & Climate Conditions/i)).toBeInTheDocument();
    expect(screen.getByText('79/100')).toBeInTheDocument();
    expect(screen.getByText(/Temp: 28.5°C/i)).toBeInTheDocument();

    expect(screen.getByText(/3. Historical Precedent & Endemicity/i)).toBeInTheDocument();
    expect(screen.getByText('65/100')).toBeInTheDocument();

    expect(screen.getByText(/4. Vaccination Immunity Gap/i)).toBeInTheDocument();
    expect(screen.getByText('84/100')).toBeInTheDocument();
    expect(screen.getByText(/Block Vaccination Rate: 42.5%/i)).toBeInTheDocument();

    // Statutory Actions
    expect(
      screen.getByText(/High aerosol transmission risk in dense livestock corridor/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Enforce 10km quarantine perimeter/i)).toBeInTheDocument();

    // Contributing reports
    await waitFor(() => {
      expect(screen.getByText('TAG-MH-9812')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button or Escape key is pressed', () => {
    const handleClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <OutbreakDossierDrawer
          outbreak={mockOutbreak}
          onClose={handleClose}
          onNavigateToIntelligence={vi.fn()}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByLabelText('Close Outbreak Dossier'));
    expect(handleClose).toHaveBeenCalled();

    // Test Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
