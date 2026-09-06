import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtocolsReferencePage } from '../pages/ProtocolsReferencePage';
import { diseaseService } from '../core/api/diseaseService';
import { DiseaseMetadata } from '../core/types/disease.types';
import { OutbreakResponse } from '../core/types/outbreak.types';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getDiseaseRegistry: vi.fn(),
    listOutbreaks: vi.fn(),
  },
}));

const mockRegistry: DiseaseMetadata[] = [
  {
    diseaseName: 'Foot and Mouth Disease',
    severity: 'HIGH',
    zoonotic: false,
    reportable: true,
    mortality: 'MEDIUM',
    defaultRadiusKm: 25.0,
    minimumCases: 3,
    evaluationWindowHours: 48,
    vaccineAvailable: true,
  },
  {
    diseaseName: 'Anthrax',
    severity: 'CRITICAL',
    zoonotic: true,
    reportable: true,
    mortality: 'VERY_HIGH',
    defaultRadiusKm: 30.0,
    minimumCases: 1,
    evaluationWindowHours: 24,
    vaccineAvailable: true,
  },
  {
    diseaseName: 'Bovine Mastitis',
    severity: 'MEDIUM',
    zoonotic: false,
    reportable: false,
    mortality: 'LOW',
    defaultRadiusKm: 10.0,
    minimumCases: 5,
    evaluationWindowHours: 72,
    vaccineAvailable: false,
  },
];

const mockOutbreaks: OutbreakResponse[] = [
  {
    id: 'outbreak-pune-fmd',
    diseaseName: 'Foot and Mouth Disease',
    centerLatitude: 18.5204,
    centerLongitude: 73.8567,
    radiusKm: 25.0,
    status: 'ACTIVE',
    riskScore: 'HIGH',
    compositeRiskScore: 82,
    affectedReportsCount: 6,
    createdAt: '2026-08-30T10:00:00Z',
  },
];

describe('ProtocolsReferencePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders title, summary strip, filter bar, and disease catalog cards when registry loads', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    // Title
    expect(
      screen.getByText('Veterinary Biosecurity Protocol Reference')
    ).toBeInTheDocument();

    // Summary Strip and cards
    await waitFor(() => {
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
      expect(screen.getByText('Anthrax')).toBeInTheDocument();
      expect(screen.getByText('Bovine Mastitis')).toBeInTheDocument();
    });
  });

  it('displays CONFIGURATION / DATA UNAVAILABLE state when /api/v1/disease/registry fails', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockRejectedValue(
      new Error('Network error: connection refused')
    );
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load the PASHU SATHI Disease Registry.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('CONFIGURATION / DATA UNAVAILABLE')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Retry Connection')
      ).toBeInTheDocument();
    });

    // Verify no fallback diseases are rendered
    expect(screen.queryByText('Foot and Mouth Disease')).not.toBeInTheDocument();
    expect(screen.queryByText('Anthrax')).not.toBeInTheDocument();
    expect(screen.queryByText('Rabies')).not.toBeInTheDocument();
  });

  it('filters catalog cards by search query', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by Disease Name, Category, or Susceptible Species...'
    );
    fireEvent.change(searchInput, { target: { value: 'Anthrax' } });

    expect(screen.getByText('Anthrax')).toBeInTheDocument();
    expect(screen.queryByText('Foot and Mouth Disease')).not.toBeInTheDocument();
    expect(screen.queryByText('Bovine Mastitis')).not.toBeInTheDocument();
  });

  it('filters catalog cards by zoonotic status', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
    });

    const zoonoticSelect = screen.getByLabelText('Zoonotic Status:');
    fireEvent.change(zoonoticSelect, { target: { value: 'ZOONOTIC' } });

    // Anthrax is Zoonotic (true)
    expect(screen.getByText('Anthrax')).toBeInTheDocument();
    // Foot and Mouth Disease is non-zoonotic (false)
    expect(screen.queryByText('Foot and Mouth Disease')).not.toBeInTheDocument();
    // Bovine Mastitis is non-zoonotic (false)
    expect(screen.queryByText('Bovine Mastitis')).not.toBeInTheDocument();
  });

  it('opens protocol detail drawer when Open Protocol Reference is clicked', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
    });

    const openButtons = screen.getAllByText('Open Protocol Reference');
    fireEvent.click(openButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('protocol-detail-drawer')).toBeInTheDocument();
      expect(
        screen.getByText('1. Epidemiological Surveillance Parameters')
      ).toBeInTheDocument();
      expect(screen.getByText('2. Field Syndromic Recognition')).toBeInTheDocument();
      expect(
        screen.getByText('3. Containment & Biosecurity Guidance')
      ).toBeInTheDocument();
      expect(
        screen.getByText('6. Departmental Gazette & Statutory Orders')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Protocol content not configured\. Authoritative departmental standard operating procedure required\./)
      ).toBeInTheDocument();
    });

    // Close drawer
    const closeBtn = screen.getByText('Close Reference');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('protocol-detail-drawer')).not.toBeInTheDocument();
    });
  });

  it('automatically opens protocol detail when initialDiseaseName prop is provided', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage initialDiseaseName="Anthrax" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protocol-detail-drawer')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Anthrax').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ZOONOTIC RISK')).toBeInTheDocument();
    expect(
      screen.getByText(/Protocol content not configured\. Authoritative departmental SOP required for clinical recognition criteria\./)
    ).toBeInTheDocument();
  });

  it('displays empty state message when search yields no matches', async () => {
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);
    vi.mocked(diseaseService.listOutbreaks).mockResolvedValue(mockOutbreaks);

    render(
      <QueryClientProvider client={queryClient}>
        <ProtocolsReferencePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by Disease Name, Category, or Susceptible Species...'
    );
    fireEvent.change(searchInput, { target: { value: 'NonExistentPathogenXYZ' } });

    expect(
      screen.getByText('No matching biosecurity protocols found for the selected filters.')
    ).toBeInTheDocument();
    expect(screen.getByText('Reset All Filters')).toBeInTheDocument();
  });
});
