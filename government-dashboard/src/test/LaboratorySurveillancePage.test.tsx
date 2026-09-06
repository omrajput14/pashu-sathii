import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LaboratorySurveillancePage } from '../pages/LaboratorySurveillancePage';
import { diseaseService } from '../core/api/diseaseService';
import { DiseaseReportResponse, Page } from '../core/types/disease.types';
import { OutbreakResponse } from '../core/types/outbreak.types';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    listReports: vi.fn(),
    listOutbreaks: vi.fn(),
    getDiseaseRegistry: vi.fn(),
  },
}));

const mockReports: DiseaseReportResponse[] = [
  {
    id: 'report-lab-001',
    animalId: 'animal-1',
    tagNumber: 'TAG-MH-001',
    animalName: 'Gauri',
    medicalRecordId: 'med-1',
    aiScanId: null,
    reportedById: 'user-vet-1',
    reportedByName: 'Dr. Deshmukh',
    reportSource: 'VET_CONSULTATION',
    diagnosisConfidenceSource: 'LAB_CONFIRMED',
    diseaseName: 'Foot and Mouth Disease',
    diagnosisStatus: 'CONFIRMED',
    latitude: 18.5204,
    longitude: 73.8567,
    notes: 'PCR assay positive for FMDV Type O',
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: '2026-08-29T10:00:00Z',
  },
  {
    id: 'report-vet-002',
    animalId: 'animal-2',
    tagNumber: 'TAG-MH-002',
    animalName: 'Lakshmi',
    medicalRecordId: 'med-2',
    aiScanId: null,
    reportedById: 'user-vet-1',
    reportedByName: 'Dr. Deshmukh',
    reportSource: 'VET_CONSULTATION',
    diagnosisConfidenceSource: 'VETERINARIAN',
    diseaseName: 'Foot and Mouth Disease',
    diagnosisStatus: 'CONFIRMED',
    latitude: 18.5210,
    longitude: 73.8570,
    notes: 'Clinical oral blisters and fever observed',
    createdAt: '2026-08-29T11:00:00Z',
    updatedAt: '2026-08-29T11:00:00Z',
  },
  {
    id: 'report-ai-003',
    animalId: 'animal-3',
    tagNumber: 'TAG-MH-003',
    animalName: 'Nandi',
    medicalRecordId: null,
    aiScanId: 'scan-1',
    reportedById: 'user-farmer-1',
    reportedByName: 'Farmer Bob',
    reportSource: 'FARMER_REPORT',
    diagnosisConfidenceSource: 'AI_VERIFIED',
    diseaseName: 'Lumpy Skin Disease',
    diagnosisStatus: 'SUSPECTED',
    latitude: 19.0760,
    longitude: 72.8777,
    notes: 'Nodular lesions on neck and torso',
    createdAt: '2026-08-29T12:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z',
  },
];

const mockOutbreaks: OutbreakResponse[] = [
  {
    id: 'outbreak-pune-fmd',
    diseaseName: 'Foot and Mouth Disease',
    centerLatitude: 18.5204,
    centerLongitude: 73.8567,
    radiusKm: 15.0,
    status: 'ACTIVE',
    riskScore: 'HIGH',
    compositeRiskScore: 78,
    affectedReportsCount: 3,
    createdAt: '2026-08-29T10:00:00Z',
    lastCaseReportedAt: '2026-08-29T12:00:00Z',
    riskBreakdown: {
      compositeRiskScore: 78,
      riskLevel: 'HIGH',
      clusterScore: 75,
      weatherScore: 70,
      historicalRiskScore: 60,
      vaccinationGapScore: 45.0,
      activeCasesInCluster: 3,
      weatherHumidity: 85.0,
      vaccinationCoveragePct: 55.0,
      recommendedAction: 'Deploy ring vaccination team.',
    },
  },
];

const mockRegistry = [
  {
    diseaseName: 'Foot and Mouth Disease',
    speciesAffected: 'Cattle, Buffalo',
    transmissionType: 'Aerosol, Direct Contact',
    vaccineAvailable: true,
  },
  {
    diseaseName: 'Lumpy Skin Disease',
    speciesAffected: 'Cattle',
    transmissionType: 'Vector (Mosquito/Tick)',
    vaccineAvailable: true,
  },
];

describe('LaboratorySurveillancePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders title, summary metrics, table, source distribution, and future LIMS panel', async () => {
    const pagePayload: Page<DiseaseReportResponse> = {
      content: mockReports,
      totalElements: 3,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(pagePayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    // Title
    expect(
      screen.getByText('Laboratory Surveillance & Diagnostic Intelligence')
    ).toBeInTheDocument();

    // Summary Strip & Table elements
    await waitFor(() => {
      expect(screen.getByText('Lab-Confirmed Cases')).toBeInTheDocument();
      expect(screen.getByText('Lab-Verified Pathogens')).toBeInTheDocument();
      expect(screen.getByText('Diagnostic Confidence Source Breakdown')).toBeInTheDocument();
      expect(
        screen.getByText('External Laboratory Integration Bridge (LIMS / LIS)')
      ).toBeInTheDocument();
      expect(screen.getByText('PLANNED (LIMS v2.0 SPECIFICATION)')).toBeInTheDocument();
      expect(screen.getByText('TAG-MH-001')).toBeInTheDocument();
      expect(screen.getByText('TAG-MH-002')).toBeInTheDocument();
      expect(screen.getByText('TAG-MH-003')).toBeInTheDocument();
    });
  });

  it('strictly separates Diagnosis Status and Confidence Source in table and source distribution', async () => {
    const pagePayload: Page<DiseaseReportResponse> = {
      content: mockReports,
      totalElements: 3,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(pagePayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('TAG-MH-001')).toBeInTheDocument();
    });

    // LAB_CONFIRMED badge
    expect(screen.getAllByText('LAB_CONFIRMED').length).toBeGreaterThan(0);
    // VETERINARIAN badge
    expect(screen.getAllByText('VETERINARIAN').length).toBeGreaterThan(0);
    // AI_VERIFIED badge
    expect(screen.getAllByText('AI_VERIFIED').length).toBeGreaterThan(0);
    // Distinct distinction between CONFIRMED (LAB) vs CONFIRMED vs SUSPECTED
    expect(screen.getByText('CONFIRMED (LAB)')).toBeInTheDocument();
    expect(screen.getAllByText('CONFIRMED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SUSPECTED').length).toBeGreaterThan(0);
  });

  it('filters records by LAB_CONFIRMED when quick filter is toggled', async () => {
    const pagePayload: Page<DiseaseReportResponse> = {
      content: mockReports,
      totalElements: 3,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(pagePayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('TAG-MH-001')).toBeInTheDocument();
    });

    // Click quick filter: "Filter: LAB_CONFIRMED"
    const filterBtn = screen.getByText('Filter: LAB_CONFIRMED');
    fireEvent.click(filterBtn);

    // TAG-MH-001 is LAB_CONFIRMED, should remain visible
    expect(screen.getByText('TAG-MH-001')).toBeInTheDocument();
    // TAG-MH-002 is VETERINARIAN, should be filtered out
    expect(screen.queryByText('TAG-MH-002')).not.toBeInTheDocument();
    // TAG-MH-003 is AI_VERIFIED, should be filtered out
    expect(screen.queryByText('TAG-MH-003')).not.toBeInTheDocument();
  });

  it('filters records by search text', async () => {
    const pagePayload: Page<DiseaseReportResponse> = {
      content: mockReports,
      totalElements: 3,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(pagePayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('TAG-MH-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by Report ID, Animal Tag, Disease, Reporter Name, or Clinical Notes...'
    );
    fireEvent.change(searchInput, { target: { value: 'Lumpy' } });

    expect(screen.getByText('TAG-MH-003')).toBeInTheDocument();
    expect(screen.queryByText('TAG-MH-001')).not.toBeInTheDocument();
  });

  it('renders informative empty state when no laboratory records match', async () => {
    const emptyPayload: Page<DiseaseReportResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: true,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(emptyPayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue([]);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'No laboratory-confirmed surveillance records currently available for the selected filters.'
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Laboratory integration with external diagnostic systems \(LIMS\) is planned\./)
    ).toBeInTheDocument();
  });

  it('renders error state and retry button on API failure', async () => {
    vi.mocked(diseaseService.listReports).mockRejectedValue(new Error('Network Gateway Timeout 504'));
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue([]);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('FAILED TO INGEST LABORATORY SURVEILLANCE TELEMETRY')
      ).toBeInTheDocument();
      expect(screen.getByText('Network Gateway Timeout 504')).toBeInTheDocument();
      expect(screen.getByText('Retry Gateway Connection')).toBeInTheDocument();
    });
  });

  it('opens CaseDetailDrawer when inspect is clicked on a report row', async () => {
    const pagePayload: Page<DiseaseReportResponse> = {
      content: mockReports,
      totalElements: 3,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    vi.mocked(diseaseService.listReports).mockResolvedValue(pagePayload);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    render(
      <QueryClientProvider client={queryClient}>
        <LaboratorySurveillancePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Inspect').length).toBeGreaterThan(0);
    });

    const inspectButtons = screen.getAllByText('Inspect');
    fireEvent.click(inspectButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('case-detail-drawer')).toBeInTheDocument();
      expect(screen.getByText('PCR assay positive for FMDV Type O')).toBeInTheDocument();
    });
  });
});
