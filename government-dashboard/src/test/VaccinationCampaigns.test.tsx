import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaccinationCampaignsTable } from '../components/vaccination/VaccinationCampaignsTable';
import { LaunchCampaignModal } from '../components/vaccination/LaunchCampaignModal';
import { campaignService } from '../core/api/campaignService';
import { diseaseService } from '../core/api/diseaseService';
import { gisService } from '../core/api/gisService';

vi.mock('../core/api/campaignService', () => ({
  campaignService: {
    listCampaigns: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaignStatus: vi.fn(),
    getStatistics: vi.fn(),
    getAuditLogs: vi.fn(),
  },
}));

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getDiseaseRegistry: vi.fn(),
  },
}));

vi.mock('../core/api/gisService', () => ({
  gisService: {
    getDistricts: vi.fn(),
  },
}));

const mockCampaigns = [
  {
    id: 'camp-123',
    campaignName: 'Baramati FMD Emergency Ring Drive 2026',
    diseaseName: 'Foot and Mouth Disease',
    targetDistrict: 'Pune',
    targetTaluka: 'Baramati',
    targetLivestockCount: 500,
    plannedDoses: 1500,
    administeredDoses: 300,
    coverageProgressPercentage: 20.0,
    priority: 'HIGH',
    status: 'ACTIVE',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    outbreakId: 'outbreak-uuid-1',
    createdById: 'user-officer-1',
    createdByName: 'officer@gov.vetra.in',
    notes: 'Emergency containment',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
];

describe('Phase 4A: Vaccination Campaign Management UI', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue([
      { diseaseName: 'Foot and Mouth Disease' },
      { diseaseName: 'Rabies' },
    ] as any);
    vi.mocked(gisService.getDistricts).mockResolvedValue(['Pune', 'Satara', 'Ahmednagar']);
  });

  it('renders clean empty state when no campaigns exist', async () => {
    vi.mocked(campaignService.listCampaigns).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <VaccinationCampaignsTable onOpenLaunchModal={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No vaccination campaigns found')).toBeInTheDocument();
      expect(screen.getByText('Launch New Campaign')).toBeInTheDocument();
    });
  });

  it('renders real campaign records with dose progress bar and status badges', async () => {
    vi.mocked(campaignService.listCampaigns).mockResolvedValue({
      content: mockCampaigns as any,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <VaccinationCampaignsTable onOpenLaunchModal={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Baramati FMD Emergency Ring Drive 2026')).toBeInTheDocument();
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
      expect(screen.getByText('300 / 1,500')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  it('handles 403 Forbidden without silent mock fallback and displays authorization alert', async () => {
    vi.mocked(campaignService.listCampaigns).mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'Access denied' },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <VaccinationCampaignsTable onOpenLaunchModal={vi.fn()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Authorization Required/i)).toBeInTheDocument();
      expect(screen.queryByText('Baramati FMD Emergency Ring Drive 2026')).not.toBeInTheDocument();
    });
  });

  it('pre-fills disease, area, priority and outbreakId in LaunchCampaignModal for Ring Campaign', async () => {
    const initialRingData = {
      campaignName: 'Pune Dairy Sector Alpha Ring Vaccination Containment 2026',
      diseaseName: 'Foot and Mouth Disease',
      targetDistrict: 'Pune',
      targetTaluka: 'Baramati',
      plannedDoses: 1500,
      priority: 'CRITICAL' as const,
      outbreakId: 'outbreak-uuid-1',
      notes: 'Emergency ring containment',
    };

    render(
      <LaunchCampaignModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        initialData={initialRingData}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pune Dairy Sector Alpha Ring Vaccination Containment 2026')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
      expect(screen.getByText(/Linked Outbreak Containment/i)).toBeInTheDocument();
    });
  });

  it('submits campaign creation with valid parameters', async () => {
    vi.mocked(campaignService.createCampaign).mockResolvedValue(mockCampaigns[0] as any);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <LaunchCampaignModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        initialData={{
          campaignName: 'Test Campaign',
          diseaseName: 'Rabies',
          targetDistrict: 'Satara',
          plannedDoses: 500,
          priority: 'MEDIUM',
        }}
      />
    );

    const submitBtn = screen.getByText('Authorize & Launch Campaign');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(campaignService.createCampaign).toHaveBeenCalledTimes(1);
    });
  });
});
